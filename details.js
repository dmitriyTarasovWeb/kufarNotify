'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const EVENT_TYPES = new Set(['accepted', 'rejected', 'error', 'notice']);

const ERROR_LABELS = {
    AI_TIMEOUT: 'Тайм-аут модели',
    AI_MODEL_OVERLOADED: 'Модель перегружена (HTTP 503)',
    AI_RATE_LIMIT: 'Лимит запросов / квоты Gemini',
    AI_AUTH: 'Ошибка API-ключа или доступа',
    AI_INVALID_RESPONSE: 'Некорректный ответ Gemini',
    AI_MISSING_DECISION: 'Gemini не вернул решение для объявления',
    AI_NETWORK: 'Сетевая ошибка',
    AI_SERVER_ERROR: 'Внутренняя ошибка сервера Gemini',
    AI_BAD_REQUEST: 'Некорректный запрос к Gemini',
    AI_BLOCKED: 'Ответ заблокирован политиками Gemini',
    AI_HTTP_ERROR: 'Ошибка HTTP API',
    AI_UNKNOWN: 'Неизвестная ошибка AI',
    AI_ACCEPTED: 'Объявление принято AI',
    AI_REJECTED: 'Объявление отклонено AI',
    AI_MODEL_FALLBACK: 'Ошибка обойдена: использована другая модель или токен',
    AI_AUTO_DISABLED: 'AI автоматически отключён после исчерпания квот',
    AI_RETRY_SUMMARY: 'Повторные попытки Gemini не помогли'
};

let configured = false;
let reportDirectory = '';
let publicBaseUrl = '';
let reportTimezone = 'Europe/Minsk';
const eventsByPublicId = new Map();
const eventsByChatId = new Map();
const weeklyReportTokens = new Map();
const WEEKLY_REPORT_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const ERROR_REPORT_TTL_MS = 48 * 60 * 60 * 1000;
const ERROR_REPORT_CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

let errorReportCleanupTimer = null;


const toText = (value, maxLength = 10000) => String(value ?? '').replace(/\u0000/g, '').slice(0, maxLength);
const safeFilePart = value => String(value).replace(/[^\d-]/g, '_');
function isErrorReportExpired(event, now = Date.now()) {
    if (!event || event.type !== 'error') return false;
    if (event.reportExpired === true) return true;

    const timestamp = Date.parse(event.timestamp);

    return Number.isFinite(timestamp)
        && now - timestamp >= ERROR_REPORT_TTL_MS;
}

function redactExpiredErrorReport(event) {
    if (!event || event.type !== 'error') return false;

    const hasDetails =
        event.reportExpired !== true ||
        Boolean(
            event.title ||
            event.message ||
            event.model ||
            event.ad ||
            event.metadata
        );

    if (!hasDetails) return false;

    // Сохраняем дату, тип и код ошибки для недельной статистики.
    // Подробности, относящиеся к HTML-отчёту, удаляем.
    event.reportExpired = true;
    event.title = '';
    event.message = '';
    event.model = '';
    event.ad = null;
    event.metadata = null;

    return true;
}

function persistExpiredReportDetails(chatId, expiredEvents) {
    if (!expiredEvents.length) return;

    const filePath = path.join(
        reportDirectory,
        `${safeFilePart(chatId)}.jsonl`
    );

    try {
        if (!fs.existsSync(filePath)) return;

        const replacements = new Map(
            expiredEvents.map(event => [
                String(event.id),
                JSON.stringify(event)
            ])
        );

        const content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Обновляем только истёкшие записи, остальные строки журнала
        // оставляем без изменений.
        const updatedLines = content.split('\n').map(line => {
            if (!line.trim()) return line;

            try {
                const savedEvent = JSON.parse(line);
                const replacement = replacements.get(
                    String(savedEvent.id)
                );

                if (replacement !== undefined) {
                    if (line !== replacement) changed = true;
                    return replacement;
                }
            } catch (_) {
                // Не изменяем строки, которые не удалось разобрать.
            }

            return line;
        });

        if (changed) {
            fs.writeFileSync(
                filePath,
                updatedLines.join('\n'),
                'utf8'
            );
        }
    } catch (error) {
        console.error(
            'Не удалось удалить подробности истёкших AI-отчётов:',
            error.message
        );
    }
}

function cleanupExpiredErrorReports() {
    if (!configured) return;

    const now = Date.now();

    for (const [chatId, events] of eventsByChatId.entries()) {
        const expiredEvents = [];

        for (const event of events) {
            if (!isErrorReportExpired(event, now)) continue;

            if (redactExpiredErrorReport(event)) {
                expiredEvents.push(event);
            }

            if (event.publicId) {
                eventsByPublicId.delete(String(event.publicId));
            }
        }

        if (expiredEvents.length) {
            persistExpiredReportDetails(chatId, expiredEvents);
        }
    }
}
const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function initialize(options = {}) {
    const root = options.directoryPath || __dirname;
    reportDirectory = options.reportDirectory || path.join(root, 'ai-details');
    reportTimezone = options.timezone || process.env.AI_REPORT_TIMEZONE || 'Europe/Minsk';
    publicBaseUrl = String(
        options.baseUrl || process.env.AI_REPORT_BASE_URL || process.env.PUBLIC_BASE_URL || process.env.RENDER_EXTERNAL_URL || ''
    ).trim().replace(/\/+$/, '');

    fs.mkdirSync(reportDirectory, { recursive: true });
    eventsByPublicId.clear();
    eventsByChatId.clear();

    for (const filename of fs.readdirSync(reportDirectory)) {
        if (!/^[-\d]+\.jsonl$/.test(filename)) continue;
        const chatId = filename.slice(0, -'.jsonl'.length);
        const filePath = path.join(reportDirectory, filename);
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error('Не удалось прочитать AI-журнал:', filename, error.message);
            continue;
        }

        const userEvents = [];
        for (const line of content.split('\n')) {
            if (!line.trim()) continue;
            try {
                const event = JSON.parse(line);
                if (!event || !event.publicId || !event.timestamp) continue;
                event.chatId = String(event.chatId || chatId);
                userEvents.push(event);
                eventsByPublicId.set(String(event.publicId), event);
            } catch (error) {
                console.error('Пропущена повреждённая запись AI-журнала:', filename, error.message);
            }
        }
        eventsByChatId.set(String(chatId), userEvents);
    }

        configured = true;

    cleanupExpiredErrorReports();

    if (!errorReportCleanupTimer) {
        errorReportCleanupTimer = setInterval(
            cleanupExpiredErrorReports,
            ERROR_REPORT_CLEANUP_INTERVAL_MS
        );

        if (typeof errorReportCleanupTimer.unref === 'function') {
            errorReportCleanupTimer.unref();
        }
    }
}

function ensureInitialized() {
    if (configured) return;
    initialize({ directoryPath: process.env.AI_REPORT_DIR || path.join(__dirname, 'data') });
}

function appendEvent(chatId, payload = {}) {
    ensureInitialized();
    const normalizedChatId = String(chatId);
    if (!/^[-\d]+$/.test(normalizedChatId)) throw new Error('Некорректный Telegram chat ID');

    const type = EVENT_TYPES.has(payload.type) ? payload.type : 'error';
    const event = {
        id: crypto.randomUUID(),
        publicId: crypto.randomBytes(20).toString('hex'),
        chatId: normalizedChatId,
        timestamp: new Date().toISOString(),
        type,
        code: toText(payload.code || (type === 'accepted' ? 'AI_ACCEPTED' : type === 'rejected' ? 'AI_REJECTED' : 'AI_UNKNOWN'), 80),
        title: toText(payload.title || '', 300),
        message: toText(payload.message || '', 12000),
        model: toText(payload.model || '', 160),
        ad: payload.ad && typeof payload.ad === 'object' ? {
            id: toText(payload.ad.id || '', 100),
            title: toText(payload.ad.title || '', 600),
            description: toText(payload.ad.description || '', 2500),
            link: toText(payload.ad.link || '', 1500),
            category: toText(payload.ad.categoryTxt || payload.ad.category || '', 300),
            region: toText(payload.ad.stateTxt || payload.ad.region || '', 200),
            city: toText(payload.ad.townTxt || payload.ad.city || '', 200),
            priceByn: Number.isFinite(Number(payload.ad.priceByn)) ? Number(payload.ad.priceByn) : null,
            reason: toText(payload.ad.aiReason || '', 6000),
            aiMark: toText(payload.ad.aiMark || '', 20)
        } : null,
        metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : null
    };

    const logPath = path.join(reportDirectory, `${safeFilePart(normalizedChatId)}.jsonl`);
    try {
        fs.appendFileSync(logPath, `${JSON.stringify(event)}\n`, 'utf8');
    } catch (error) {
        console.error('Не удалось сохранить AI-журнал:', error.message);
        return null;
    }

    eventsByPublicId.set(event.publicId, event);
    if (!eventsByChatId.has(normalizedChatId)) eventsByChatId.set(normalizedChatId, []);
    eventsByChatId.get(normalizedChatId).push(event);
    return event;
}

function classifyError(error) {
    const source = error && typeof error === 'object' ? error : { message: error };
    const status = Number(source.status || source.codeStatus || 0);
    const text = `${source.geminiCode || ''} ${source.message || source.error || error || ''}`.toLowerCase();

    if (source.isTimeout || /тайм.?аут|timed?\s*out|deadline exceeded|aborterror/.test(text)) return 'AI_TIMEOUT';
    if (status === 429 || /resource_exhausted|quota[_\s-]?exceeded|rate[_\s-]?limit|too many requests|ошибк.{0,15}лимит|лимит.{0,15}gemini/.test(text)) return 'AI_RATE_LIMIT';
    if (status === 503 || /model overloaded|service unavailable|http 503|временно перегруж/.test(text)) return 'AI_MODEL_OVERLOADED';
    if (status === 401 || status === 403 || /api.?key|unauthori[sz]ed|permission denied|forbidden|invalid credential|недействительн.{0,20}ключ/.test(text)) return 'AI_AUTH';
    if (/json|decisions|некорректн.{0,20}ответ|пуст.{0,15}ответ|не вернул решение|missing decision/.test(text)) return /не вернул решение|missing decision/.test(text) ? 'AI_MISSING_DECISION' : 'AI_INVALID_RESPONSE';
    if (/blocked|blockreason|safety|policy violation|заблокирован/.test(text)) return 'AI_BLOCKED';
    if (/econn|enotfound|eai_again|socket|network|fetch failed|connection reset/.test(text)) return 'AI_NETWORK';
    if (status >= 500) return 'AI_SERVER_ERROR';
    if (status === 400 || /invalid_argument|bad request/.test(text)) return 'AI_BAD_REQUEST';
    if (status >= 400) return 'AI_HTTP_ERROR';
    return 'AI_UNKNOWN';
}

function getErrorLabel(code) {
    return ERROR_LABELS[code] || ERROR_LABELS.AI_UNKNOWN;
}

function recordAdOutcome(chatId, ad, model) {
    if (!ad || typeof ad !== 'object' || (!ad.aiMark && !ad.aiError)) return null;

    let type;
    let code;
    if (ad.aiError || ad.aiMark === '⚠️') {
        type = 'error';
        code = ad.aiErrorCode || classifyError(ad.aiReason || 'AI не вернул решение');
    } else if (ad.aiKeep === false || ad.aiMark === '❌') {
        type = 'rejected';
        code = 'AI_REJECTED';
    } else {
        type = 'accepted';
        code = 'AI_ACCEPTED';
    }

    const event = appendEvent(chatId, {
        type,
        code,
        title: ad.title || (type === 'error' ? 'Ошибка обработки объявления' : type === 'rejected' ? 'Объявление отклонено' : 'Объявление принято'),
        message: type === 'error' ? (ad.aiReason || 'Gemini не смог обработать объявление.') : (ad.aiReason || ''),
        model: model || ad.aiModel || '',
        ad
    });

    if (event && type === 'error') ad.aiReportId = event.publicId;
    return event;
}

function recordBatchError(chatId, ads, model, code) {
    ensureInitialized();

    const batch = Array.isArray(ads)
        ? ads.filter(ad => ad && (ad.aiError || ad.aiMark === '⚠️'))
        : [];

    if (!batch.length) return null;

    const errorCode = code
        || batch[0].aiErrorCode
        || classifyError(batch[0].aiReason || 'AI error');

    const batchAds = batch.map(ad => ({
        id: toText(ad.id || '', 100),
        title: toText(ad.title || 'Без названия', 600),
        description: toText(ad.description || '', 2500),
        link: toText(ad.link || '', 1500),
        category: toText(ad.categoryTxt || '', 300),
        region: toText(ad.stateTxt || '', 200),
        city: toText(ad.townTxt || '', 200),
        priceByn: Number.isFinite(Number(ad.priceByn))
            ? Number(ad.priceByn)
            : null,
        reason: toText(ad.aiReason || '', 6000),
        code: toText(ad.aiErrorCode || errorCode, 80)
    }));

    const firstAd = batch[0];

    const report = appendEvent(chatId, {
        type: 'error',
        code: errorCode,
        title: `Ошибка AI в пачке (${batch.length} объявлений)`,
        message: firstAd.aiReason
            || `Одна ошибка AI затронула ${batch.length} объявлений.`,
        model: model || firstAd.aiModel || '',
        ad: firstAd,
        metadata: {
            batchError: true,
            batchSize: batch.length,
            batchAds
        }
    });

    if (!report) return null;

    for (let i = 1; i < batch.length; i++) {
        const ad = batch[i];

        appendEvent(chatId, {
            type: 'error',
            code: ad.aiErrorCode || errorCode,
            title: `Ошибка AI: ${toText(ad.title || 'Без названия', 300)}`,
            message: ad.aiReason || report.message,
            model: ad.aiModel || model || '',
            ad,
            metadata: {
                batchMember: true,
                batchReportId: report.publicId
            }
        });
    }

    for (const ad of batch) {
        ad.aiReportId = report.publicId;
    }

    return report;
}

function recordNotice(chatId, payload = {}) {
    return appendEvent(chatId, {
        type: 'notice',
        code: payload.code || 'AI_MODEL_FALLBACK',
        title: payload.title || 'Информационное событие AI',
        message: payload.message || '',
        model: payload.model || '',
        ad: payload.ad || null,
        metadata: payload.metadata || null
    });
}

function getReportUrl(chatId, publicId) {
    ensureInitialized();
    if (!publicBaseUrl || !publicId) return null;
    const event = eventsByPublicId.get(String(publicId));
    if (!event || String(event.chatId) !== String(chatId)) return null;
    return `${publicBaseUrl}/ai-report/${encodeURIComponent(String(publicId))}`;
}

function getReportButton(chatId, publicId) {
    const url = getReportUrl(chatId, publicId);
    if (url) return { text: '📄 Подробный отчёт об ошибке', url };
    if (publicId) return { text: '📄 Подробный отчёт об ошибке', callback_data: `ai_report_${String(publicId)}`.slice(0, 64) };
    return null;
}

function getEvent(publicId) {
    ensureInitialized();
    return eventsByPublicId.get(String(publicId)) || null;
}

function getUserEvents(chatId) {
    ensureInitialized();
    return eventsByChatId.get(String(chatId)) || [];
}

function getDateParts(dateOrTimestamp) {
    const date = dateOrTimestamp instanceof Date ? dateOrTimestamp : new Date(dateOrTimestamp);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: reportTimezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(date);
    const mapped = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    return {
        year: Number(mapped.year), month: Number(mapped.month), day: Number(mapped.day),
        dateKey: `${mapped.year}-${mapped.month}-${mapped.day}`,
        weekday: mapped.weekday,
        hour: Number(mapped.hour), minute: Number(mapped.minute), second: Number(mapped.second)
    };
}

function getLastSevenDateKeys() {
    const nowParts = getDateParts(new Date());
    const start = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day, 12, 0, 0);
    const keys = [];
    for (let offset = 6; offset >= 0; offset--) {
        const noon = new Date(start - offset * 86400000);
        keys.push(getDateParts(noon).dateKey);
    }
    return keys;
}

function getWeekdayOrder(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return (jsDay + 6) % 7;
}

function formatDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' })
        .format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function formatDateTime(timestamp) {
    try {
        return new Intl.DateTimeFormat('ru-RU', {
            timeZone: reportTimezone,
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
        }).format(new Date(timestamp));
    } catch (_) {
        return new Date(timestamp).toLocaleString('ru-RU');
    }
}

function classifyForSummary(event) {
    if (event.type === 'error') return event.code || 'AI_UNKNOWN';
    return event.type;
}

function summarize(events) {
    const summary = { total: 0, accepted: 0, rejected: 0, errors: 0, notices: 0 };
    for (const event of events) {
        if (event.type === 'accepted') summary.accepted++;
        else if (event.type === 'rejected') summary.rejected++;
        else if (event.type === 'error') summary.errors++;
        else if (event.type === 'notice') summary.notices++;
    }
    summary.total = summary.accepted + summary.rejected + summary.errors;
    summary.successRate = summary.total ? Math.round((summary.accepted / summary.total) * 100) : 0;
    return summary;
}

function shortTime(event) {
    const parts = getDateParts(event.timestamp);
    return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}`;
}

function renderEventHtml(event) {
    const isError = event.type === 'error';
    const isNotice = event.type === 'notice';
    const codeLabel = (isError || isNotice) ? getErrorLabel(event.code) : (event.type === 'rejected' ? 'Отклонено' : 'Принято');
    const status = isError ? 'ОШИБКА' : (isNotice ? 'УВЕДОМЛЕНИЕ' : (event.type === 'rejected' ? 'ОТКЛОНЕНО AI' : 'ПРИНЯТО AI'));
    const badgeClass = isError ? 'red' : (isNotice ? 'blue' : (event.type === 'rejected' ? 'muted' : 'green'));
    const ad = event.ad || {};
    const detailText = event.message || (ad.reason || 'Подробности не сохранены.');
    const safeLink = /^https?:\/\//i.test(ad.link || '') ? ad.link : '';

    return `<article class="event-card ${badgeClass}">
      <div class="event-top"><span class="badge ${badgeClass}">${status}</span><time>${escapeHtml(formatDateTime(event.timestamp))}</time></div>
      <h4>${escapeHtml(event.title || ad.title || codeLabel)}</h4>
      <div class="event-code"><strong>${escapeHtml(event.code || '—')}</strong> · ${escapeHtml(codeLabel)}</div>
      ${event.model ? `<div class="meta-line">Модель: <code>${escapeHtml(event.model)}</code></div>` : ''}
      ${ad.title ? `<div class="meta-line">Объявление: <strong>${escapeHtml(ad.title)}</strong></div>` : ''}
      ${ad.priceByn !== null && ad.priceByn !== undefined ? `<div class="meta-line">Цена: ${escapeHtml(ad.priceByn === 0 ? 'Договорная' : `${ad.priceByn} BYN`)}</div>` : ''}
      ${ad.category || ad.region || ad.city ? `<div class="meta-line">${escapeHtml([ad.category, ad.region, ad.city].filter(Boolean).join(' · '))}</div>` : ''}
      <div class="event-message">${escapeHtml(detailText).replace(/\n/g, '<br>')}</div>
      ${safeLink ? `<a class="ad-link" href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer">Открыть объявление ↗</a>` : ''}
    </article>`;
}

function baseStyles() {
    return `
    :root{color-scheme:dark;--bg:#0a1020;--panel:#121b2d;--panel2:#17243a;--line:#283750;--text:#edf3ff;--muted:#9aabc5;--green:#45d6a0;--red:#ff687d;--blue:#65a8ff;--amber:#f3bd65}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(1000px 500px at 10% -10%,#1a2c4c 0%,transparent 70%),var(--bg);color:var(--text);font:15px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    a{color:#9bc4ff} .wrap{width:min(1120px,100%);margin:0 auto;padding:28px 18px 48px}.eyebrow{color:#8aa5cd;letter-spacing:.13em;text-transform:uppercase;font-size:11px;font-weight:800}.hero{display:flex;gap:18px;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.hero h1{font-size:clamp(25px,4vw,38px);line-height:1.12;margin:7px 0 10px;letter-spacing:-.035em}.sub{color:var(--muted);margin:0}.stamp{white-space:nowrap;border:1px solid var(--line);background:#111b2a;border-radius:999px;padding:8px 12px;color:#bed0e9;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:20px 0}.stat{padding:17px;border-radius:16px;border:1px solid var(--line);background:linear-gradient(155deg,#17243a,#101827);min-width:0}.stat .label{color:var(--muted);font-size:12px}.stat .value{font-size:clamp(24px,3vw,34px);font-weight:800;letter-spacing:-.04em;margin-top:5px}.stat .hint{color:#8ea2bd;font-size:11px;margin-top:2px}.value.green{color:var(--green)}.value.red{color:var(--red)}.value.blue{color:var(--blue)}.value.amber{color:var(--amber)}
    .panel{border:1px solid var(--line);background:rgba(18,27,45,.92);border-radius:18px;padding:20px;margin:16px 0;box-shadow:0 12px 40px #0002}.section-head{display:flex;gap:12px;justify-content:space-between;align-items:end;margin:0 0 14px}.section-head h2{font-size:18px;letter-spacing:-.02em;margin:0}.section-head p{font-size:12px;color:var(--muted);margin:3px 0 0}.pill{border:1px solid #34445e;color:#b7c9e4;font-size:11px;border-radius:999px;padding:4px 9px;white-space:nowrap}
    .day-list{display:grid;gap:10px}.day{border:1px solid var(--line);border-radius:13px;overflow:hidden;background:#101a2a}.day>summary,.hour>summary{cursor:pointer;list-style:none}.day>summary::-webkit-details-marker,.hour>summary::-webkit-details-marker{display:none}.day-summary{display:grid;grid-template-columns:minmax(130px,1fr) 2fr auto;align-items:center;gap:15px;padding:14px 15px}.day-summary:hover,.hour>summary:hover{background:#192840}.day-name{font-weight:750}.date-label{display:block;color:var(--muted);font-size:11px;font-weight:500}.counts{display:flex;flex-wrap:wrap;gap:8px;font-size:12px;color:#b9c9df}.count{white-space:nowrap}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 5px 1px 0}.dot.red{background:var(--red);box-shadow:0 0 10px #ff687d55}.dot.blue{background:var(--blue);box-shadow:0 0 10px #65a8ff55}.dot.green{background:var(--green)}.dot.gray{background:#8fa0b8}.chev{color:#7790b5;transition:transform .15s}.day[open]>summary .chev{transform:rotate(180deg)}.day-body{border-top:1px solid var(--line);padding:10px}.hour-list{display:grid;gap:5px}.hour{border-radius:9px;border:1px solid transparent}.hour>summary{padding:10px 11px;border-radius:8px;display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:12px;align-items:center}.hour-time{font-weight:750;font-variant-numeric:tabular-nums}.hour-counts{display:flex;gap:9px;flex-wrap:wrap;color:#9fb0c8;font-size:12px}.hour-events{padding:6px 10px 12px 20px;border-top:1px solid #24334a}.empty{color:#8194b1;font-size:12px;padding:7px 0}.event-card{border:1px solid var(--line);border-left:3px solid var(--line);border-radius:10px;padding:12px 14px;margin:8px 0;background:#0f1929}.event-card.red{border-left-color:var(--red)}.event-card.blue{border-left-color:var(--blue)}.event-card.green{border-left-color:var(--green)}.event-card.muted{border-left-color:#7e90aa}.event-top{display:flex;align-items:center;gap:10px;justify-content:space-between;color:var(--muted);font-size:11px}.badge{display:inline-flex;align-items:center;border-radius:999px;padding:3px 8px;font-size:10px;font-weight:900;letter-spacing:.06em}.badge.red{color:#ff9baa;background:#50202e}.badge.blue{color:#a6caff;background:#1b3355}.badge.green{color:#8df0c7;background:#163b36}.badge.muted{color:#bdc9dc;background:#273449}.event-card h4{margin:8px 0 4px;font-size:14px}.event-code,.meta-line{font-size:12px;color:#9fb0c8;margin-top:4px;overflow-wrap:anywhere}.event-code code,.meta-line code{color:#d3dff3}.event-message{font-size:13px;color:#d8e2f2;background:#0a1220;border:1px solid #223149;padding:10px 11px;border-radius:8px;margin-top:10px;overflow-wrap:anywhere}.ad-link{display:inline-block;margin-top:9px;font-size:12px;text-decoration:none}.ad-link:hover{text-decoration:underline}
    .chart-row{display:grid;grid-template-columns:120px minmax(100px,1fr) 190px;gap:14px;align-items:center;padding:9px 0;border-bottom:1px solid #25334a}.chart-row:last-child{border-bottom:0}.chart-label{font-size:12px}.bar{height:9px;display:flex;align-items:stretch;overflow:hidden;background:#202d42;border-radius:99px;min-width:0}.bar span{height:100%;min-width:0}.bar .accepted{background:var(--green)}.bar .rejected{background:#91a2ba}.bar .errors{background:var(--red)}.bar .notices{background:var(--blue)}.legend{display:flex;flex-wrap:wrap;gap:12px;color:var(--muted);font-size:11px;margin-top:14px}.best-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.best{border:1px solid var(--line);background:#101a2a;border-radius:12px;padding:14px}.best .label{color:var(--muted);font-size:12px}.best strong{display:block;font-size:19px;margin-top:4px}.code-table{width:100%;border-collapse:collapse;font-size:12px}.code-table th,.code-table td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line)}.code-table th{color:var(--muted);font-weight:600}.code-table td:last-child,.code-table th:last-child{text-align:right;font-variant-numeric:tabular-nums}.footer{color:#7186a6;font-size:11px;text-align:center;margin-top:22px}.notice{border:1px solid #2f4a71;background:#13233a;color:#a9cfff;padding:12px 14px;border-radius:12px;font-size:12px;margin-top:14px}
    @media(max-width:760px){.wrap{padding:20px 11px 32px}.hero{display:block}.stamp{display:inline-block;margin-top:13px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.stat:last-child{grid-column:span 2}.panel{padding:14px}.day-summary{grid-template-columns:1fr auto;gap:6px}.counts{grid-column:1 / -1;grid-row:2}.chev{grid-column:2;grid-row:1}.hour>summary{grid-template-columns:52px minmax(0,1fr)}.hour-counts{grid-column:1 / -1}.chart-row{grid-template-columns:90px minmax(70px,1fr)}.chart-row .counts{grid-column:auto;grid-row:auto}.best-grid{grid-template-columns:1fr}.event-top{align-items:flex-start;flex-direction:column}.code-table th:nth-child(2),.code-table td:nth-child(2){display:none}}
    @media(prefers-reduced-motion:reduce){*{transition:none!important}}
    `;
}

function htmlDocument(title, subtitle, body) {
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escapeHtml(title)}</title><style>${baseStyles()}</style></head><body><main class="wrap"><header class="hero"><div><div class="eyebrow">AI MONITOR · ОТЧЁТ</div><h1>${escapeHtml(title)}</h1><p class="sub">${escapeHtml(subtitle)}</p></div><div class="stamp">Часовой пояс: ${escapeHtml(reportTimezone)}</div></header>${body}<div class="footer">Отчёт сформирован локально ботом · Данные AI не включают объявления, которые не проходили AI-фильтр.</div></main></body></html>`;
}

function renderSingleReportHtml(event) {
    const isError = event.type === 'error';
    const subtitle = `${isError ? 'Подробности ошибки AI' : event.type === 'notice' ? 'Информационное событие AI' : 'Событие AI'} · ${formatDateTime(event.timestamp)}`;
    const ad = event.ad || {};

    const batchAds = event.metadata
    && Array.isArray(event.metadata.batchAds)
    ? event.metadata.batchAds
    : [];

    const batchAdsSection = batchAds.length
        ? `<section class="panel">
            <div class="section-head">
                <div>
                    <h2>Объявления из этой пачки</h2>
                    <p>Количество затронутых объявлений: ${batchAds.length}</p>
                </div>
            </div>
            ${batchAds.map((item, index) => {
                const safeLink = /^https?:\/\//i.test(String(item.link || ''))
                    ? `<a class="ad-link"
                        href="${escapeHtml(item.link)}"
                        target="_blank"
                        rel="noopener noreferrer">Открыть объявление ↗</a>`
                    : '';

                return `<article class="event-card red">
                    <div class="event-top">
                        <span>Объявление ${index + 1}</span>
                        <span class="badge red">${escapeHtml(item.code || event.code || 'AI_UNKNOWN')}</span>
                    </div>
                    <h4>${escapeHtml(item.title || 'Без названия')}</h4>
                    <div class="event-message">${escapeHtml(item.reason || event.message || 'Ошибка AI')}</div>
                    ${safeLink}
                </article>`;
            }).join('')}
        </section>`
        : '';
    const statusLabel = isError ? 'Ошибка' : event.type === 'notice' ? 'Уведомление' : event.type === 'rejected' ? 'Отклонено' : 'Принято';
    const detail = event.message || ad.reason || 'Подробности не сохранены.';
    const body = `<section class="grid" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="stat"><div class="label">Статус</div><div class="value ${isError ? 'red' : event.type === 'notice' ? 'blue' : event.type === 'accepted' ? 'green' : ''}" style="font-size:22px">${escapeHtml(statusLabel)}</div><div class="hint">Тип события</div></div><div class="stat"><div class="label">Код события</div><div class="value" style="font-size:18px;overflow-wrap:anywhere">${escapeHtml(event.code || '—')}</div><div class="hint">${escapeHtml(getErrorLabel(event.code))}</div></div><div class="stat"><div class="label">Модель Gemini</div><div class="value" style="font-size:17px;overflow-wrap:anywhere">${escapeHtml(event.model || 'не указана')}</div><div class="hint">Модель, вернувшая ответ</div></div></section>
      <section class="panel"><div class="section-head"><div><h2>Что произошло</h2><p>Подробная запись журнала в момент обработки объявления</p></div><span class="pill">${escapeHtml(formatDateTime(event.timestamp))}</span></div>${renderEventHtml(event)}</section>
      ${batchAdsSection}
      ${ad.description ? `<section class="panel"><div class="section-head"><div><h2>Описание объявления</h2><p>Текст, который был доступен AI при проверке</p></div></div><div class="event-message">${escapeHtml(ad.description).replace(/\n/g, '<br>')}</div></section>` : ''}
      <section class="panel"><div class="section-head"><div><h2>Техническая классификация</h2><p>Используется для группировки похожих инцидентов в недельном отчёте</p></div></div><table class="code-table"><tbody><tr><th>Код</th><td><code>${escapeHtml(event.code || 'AI_UNKNOWN')}</code></td></tr><tr><th>Класс</th><td>${escapeHtml(getErrorLabel(event.code))}</td></tr><tr><th>Дата и время</th><td>${escapeHtml(formatDateTime(event.timestamp))}</td></tr><tr><th>ID записи</th><td><code>${escapeHtml(event.id || '—')}</code></td></tr></tbody></table></section>`;
    return htmlDocument(ad.title ? `Отчёт AI: ${ad.title}` : (event.title || 'Подробный отчёт AI'), subtitle, body);
}

function buildWeeklyReport(chatId) {
    const allUserEvents = getUserEvents(chatId);
    const dateKeys = getLastSevenDateKeys();
    const includedDates = new Set(dateKeys);
    const events = allUserEvents.filter(event => includedDates.has(getDateParts(event.timestamp).dateKey));
    const total = summarize(events);
    const dailyRows = dateKeys.map(dateKey => {
        const dayEvents = events.filter(event => getDateParts(event.timestamp).dateKey === dateKey);
        return { dateKey, events: dayEvents, summary: summarize(dayEvents) };
    }).sort((a, b) => getWeekdayOrder(a.dateKey) - getWeekdayOrder(b.dateKey));

    const hourTotals = Array.from({ length: 24 }, (_, hour) => ({ hour, accepted: 0, rejected: 0, errors: 0, notices: 0 }));
    const errorCounts = new Map();
    for (const event of events) {
        const parts = getDateParts(event.timestamp);
        const hour = hourTotals[parts.hour];
        if (event.type === 'accepted') hour.accepted++;
        else if (event.type === 'rejected') hour.rejected++;
        else if (event.type === 'error') {
            hour.errors++;
            errorCounts.set(event.code || 'AI_UNKNOWN', (errorCounts.get(event.code || 'AI_UNKNOWN') || 0) + 1);
        } else if (event.type === 'notice') hour.notices++;
    }

    const bestDay = dailyRows.reduce((best, day) => !best || day.summary.accepted > best.summary.accepted ? day : best, null);
    const bestHour = hourTotals.reduce((best, hour) => !best || hour.accepted > best.accepted ? hour : best, null);
    const maxDailyActivity = Math.max(1, ...dailyRows.map(day => day.summary.total + day.summary.notices));

    const statsCards = `<section class="grid">
      <div class="stat"><div class="label">Обработано объявлений</div><div class="value">${total.total}</div><div class="hint">Без уведомлений · успешность ${total.successRate}%</div></div>
      <div class="stat"><div class="label">Принято AI</div><div class="value green">${total.accepted}</div><div class="hint">Подходящие объявления</div></div>
      <div class="stat"><div class="label">Отклонено AI</div><div class="value">${total.rejected}</div><div class="hint">Не прошло ваш запрос</div></div>
      <div class="stat"><div class="label">Ошибки</div><div class="value red">${total.errors}</div><div class="hint">Требуют внимания</div></div>
      <div class="stat"><div class="label">Уведомления</div><div class="value blue">${total.notices}</div><div class="hint">Смена модели / обход ошибки</div></div>
    </section>`;

    const dailyChart = dailyRows.map(day => {
        const s = day.summary;
        const chartTotal = Math.max(1, maxDailyActivity);
        return `<div class="chart-row"><div class="chart-label"><strong>${escapeHtml(dayName(day.dateKey))}</strong><span class="date-label">${escapeHtml(formatDate(day.dateKey))}</span></div><div class="bar" title="Принято ${s.accepted}; отклонено ${s.rejected}; ошибок ${s.errors}"><span class="accepted" style="width:${(s.accepted / chartTotal) * 100}%"></span><span class="rejected" style="width:${(s.rejected / chartTotal) * 100}%"></span><span class="errors" style="width:${(s.errors / chartTotal) * 100}%"></span><span class="notices" style="width:${(s.notices / chartTotal) * 100}%"></span></div><div class="counts"><span class="count">✅ ${s.accepted}</span><span class="count">↘ ${s.rejected}</span><span class="count"><span class="dot red"></span>${s.errors}</span><span class="count"><span class="dot blue"></span>${s.notices}</span></div></div>`;
    }).join('');

    const dayDetails = dailyRows.map(day => {
        const s = day.summary;
        const dayNameValue = dayName(day.dateKey);
        const hourRows = Array.from({ length: 24 }, (_, hour) => {
            const hourEvents = day.events.filter(event => getDateParts(event.timestamp).hour === hour);
            const hs = summarize(hourEvents);
            const notices = hourEvents.filter(event => event.type === 'notice').length;
            const hourErrorsAndNotices = hourEvents.filter(event => event.type === 'error' || event.type === 'notice').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const eventsHtml = hourErrorsAndNotices.length
                ? hourErrorsAndNotices.map(renderEventHtml).join('')
                : '<div class="empty">В этот час ошибок и уведомлений не было.</div>';
            return `<details class="hour"><summary><span class="hour-time">${String(hour).padStart(2, '0')}:00</span><span class="hour-counts"><span>✅ ${hs.accepted}</span><span>↘ ${hs.rejected}</span><span><span class="dot red"></span>${hs.errors}</span><span><span class="dot blue"></span>${notices}</span></span><span class="chev">⌄</span></summary><div class="hour-events">${eventsHtml}</div></details>`;
        }).join('');
        return `<details class="day"><summary class="day-summary"><span class="day-name">${escapeHtml(dayNameValue)}<span class="date-label">${escapeHtml(formatDate(day.dateKey))}</span></span><span class="counts"><span class="count">✅ Принято: ${s.accepted}</span><span class="count">↘ Отклонено: ${s.rejected}</span><span class="count"><span class="dot red"></span>Ошибки: ${s.errors}</span><span class="count"><span class="dot blue"></span>Уведомления: ${s.notices}</span></span><span class="chev">⌄</span></summary><div class="day-body"><div class="hour-list">${hourRows}</div></div></details>`;
    }).join('');

    const bestDayText = bestDay && bestDay.summary.accepted > 0 ? `${dayName(bestDay.dateKey)}, ${formatDate(bestDay.dateKey)} · ${bestDay.summary.accepted} принятых` : 'Пока недостаточно данных';
    const bestHourText = bestHour && bestHour.accepted > 0 ? `${String(bestHour.hour).padStart(2, '0')}:00–${String((bestHour.hour + 1) % 24).padStart(2, '0')}:00 · ${bestHour.accepted} принятых` : 'Пока недостаточно данных';
    const maxErrorCount = Math.max(1, ...Array.from(errorCounts.values()));
    const codesTable = errorCounts.size
        ? `<table class="code-table"><thead><tr><th>Код</th><th>Классификация</th><th>Количество</th></tr></thead><tbody>${Array.from(errorCounts.entries()).sort((a, b) => b[1] - a[1]).map(([code, count]) => `<tr><td><code>${escapeHtml(code)}</code></td><td>${escapeHtml(getErrorLabel(code))}</td><td><span style="color:var(--red)">${count}</span></td></tr>`).join('')}</tbody></table>`
        : '<div class="empty">За выбранный период ошибок не зарегистрировано.</div>';

    const body = `${statsCards}
      <section class="panel"><div class="section-head"><div><h2>Активность по дням</h2><p>Сравнение числа подходящих, отклонённых объявлений и инцидентов</p></div><span class="pill">7 дней</span></div>${dailyChart}<div class="legend"><span><span class="dot green"></span>Принято AI</span><span><span class="dot gray"></span>Отклонено AI</span><span><span class="dot red"></span>Ошибки</span><span><span class="dot blue"></span>Уведомления</span></div></section>
      <section class="panel"><div class="section-head"><div><h2>Когда результат лучше</h2><p>Ориентир по числу объявлений, которые AI оставил</p></div></div><div class="best-grid"><div class="best"><div class="label">Самый результативный день</div><strong>${escapeHtml(bestDayText)}</strong></div><div class="best"><div class="label">Самый результативный час</div><strong>${escapeHtml(bestHourText)}</strong></div></div></section>
      <section class="panel"><div class="section-head"><div><h2>Ошибки по категориям</h2><p>Одинаковые технические причины сгруппированы по коду</p></div><span class="pill">${total.errors} всего</span></div>${codesTable}</section>
      <section class="panel"><div class="section-head"><div><h2>Подробная хронология</h2><p>Откройте день, затем час. Красная точка — ошибка, синяя — информационное событие.</p></div><span class="pill">Пн — Вс</span></div><div class="day-list">${dayDetails}</div><div class="notice">✅ — объявление принято AI; ↘ — отклонено. Уведомления о переключении модели и успешном обходе ошибки не отправляются в чат, а отображаются здесь в хронологическом порядке.</div></section>`;

    return {
        html: htmlDocument('Отчёт о работе AI за последнюю неделю', `${formatDate(dateKeys[0])} — ${formatDate(dateKeys[dateKeys.length - 1])} · ${total.total} обработанных объявлений`, body),
        summary: total,
        filename: `ai-report-week-${dateKeys[0]}-${dateKeys[dateKeys.length - 1]}.html`
    };
}

function dayName(dateKey) {
    const date = new Date(`${dateKey}T12:00:00Z`);
    const name = new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC', weekday: 'long' }).format(date);
    return name.charAt(0).toLocaleUpperCase('ru-RU') + name.slice(1);
}

function createWeeklyReportLink(chatId) {
    ensureInitialized();
    if (!publicBaseUrl) {
        throw new Error('Не задан AI_REPORT_BASE_URL: для HTML-отчёта в браузере нужен публичный HTTPS-адрес.');
    }

    const normalizedChatId = String(chatId);
    const report = buildWeeklyReport(normalizedChatId);
    const now = Date.now();

    for (const [token, entry] of weeklyReportTokens.entries()) {
        if (!entry || entry.expiresAt <= now) weeklyReportTokens.delete(token);
    }

    const token = crypto.randomBytes(20).toString('hex');
    weeklyReportTokens.set(token, {
        chatId: normalizedChatId,
        expiresAt: now + WEEKLY_REPORT_TOKEN_TTL_MS
    });

    while (weeklyReportTokens.size > 5000) {
        const oldestToken = weeklyReportTokens.keys().next().value;
        weeklyReportTokens.delete(oldestToken);
    }

    return {
        summary: report.summary,
        filename: report.filename,
        url: `${publicBaseUrl}/ai-report-weekly/${token}`,
        expiresAt: new Date(now + WEEKLY_REPORT_TOKEN_TTL_MS).toISOString()
    };
}

function createWeeklyReportFile(chatId) {
    const report = buildWeeklyReport(chatId);
    const safeChatId = safeFilePart(chatId);
    const filePath = path.join(os.tmpdir(), `ai-report-${safeChatId}-${Date.now()}.html`);
    fs.writeFileSync(filePath, report.html, 'utf8');
    return { ...report, filePath };
}

function cleanupReportFile(filePath) {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Не удалось удалить временный HTML-отчёт:', error.message);
    }
}

function renderTelegramEventText(event) {
    if (!event) return 'Отчёт не найден. Возможно, журнал был очищен.';
    const ad = event.ad || {};
    const lines = [
        event.type === 'error' ? '⚠️ ПОДРОБНЫЙ ОТЧЁТ AI' : event.type === 'notice' ? '🔵 УВЕДОМЛЕНИЕ AI' : '📋 ОТЧЁТ AI',
        `Время: ${formatDateTime(event.timestamp)}`,
        `Код: ${event.code || '—'} — ${getErrorLabel(event.code)}`,
        event.model ? `Модель: ${event.model}` : '',
        ad.title ? `Объявление: ${ad.title}` : '',
        ad.link ? `Ссылка: ${ad.link}` : '',
        '',
        event.message || ad.reason || 'Подробности не сохранены.'
    ].filter(Boolean);
    return lines.join('\n').slice(0, 3800);
}

function handleHttpRequest(req, res) {
    ensureInitialized();
    let pathname = '';
    try {
        pathname = new URL(req.url, 'http://localhost').pathname;
    } catch (_) {
        return false;
    }
    const weeklyMatch = pathname.match(/^\/ai-report-weekly\/([a-f0-9]{40})\/?$/i);
    const match = pathname.match(/^\/ai-report\/([a-f0-9]{40})\/?$/i);
    if (!weeklyMatch && !match) return false;
    if (req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET' });
        res.end('Method Not Allowed');
        return true;
    }

    let html;
    if (weeklyMatch) {
        const token = weeklyMatch[1];
        const entry = weeklyReportTokens.get(token);
        if (!entry || entry.expiresAt <= Date.now()) {
            weeklyReportTokens.delete(token);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(htmlDocument('Ссылка устарела', 'Ссылка на недельный отчёт больше не действует. Запросите новый отчёт в меню /ai.', '<section class="panel"><p>Откройте меню /ai и нажмите «Отчёт о работе AI за последнюю неделю», чтобы создать новую ссылку.</p></section>'));
            return true;
        }
        html = buildWeeklyReport(entry.chatId).html;
    } else {
        const event = getEvent(match[1]);
        if (!event) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(htmlDocument('Отчёт не найден', 'Запись отсутствует в журнале AI.', '<section class="panel"><p>Отчёт не найден или больше не доступен.</p></section>'));
            return true;
        }
        html = renderSingleReportHtml(event);
    }

    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    });
    res.end(html);
    return true;
}

module.exports = {
    initialize,
    classifyError,
    getErrorLabel,
    recordAdOutcome,
    recordNotice,
    getEvent,
    getReportUrl,
    getReportButton,
    getUserEvents,
    buildWeeklyReport,
    createWeeklyReportFile,
    createWeeklyReportLink,
    cleanupReportFile,
    renderTelegramEventText,
    handleHttpRequest,
    recordBatchError
};
