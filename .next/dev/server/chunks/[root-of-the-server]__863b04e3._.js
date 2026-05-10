module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://efpnjcjibjhdjzcxnxet.supabase.co"), ("TURBOPACK compile-time value", "sb_publishable_xgQhkxtKxdlr3lpLQAmLTA_MS7uNjQY"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // Server Components cannot set cookies — handled by middleware
                }
            }
        }
    });
}
}),
"[project]/lib/ai-usage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FREE_LIMITS",
    ()=>FREE_LIMITS,
    "checkAndIncrementUsage",
    ()=>checkAndIncrementUsage,
    "getUsageStatus",
    ()=>getUsageStatus
]);
const FREE_LIMITS = {
    chat: 30,
    insights: 5,
    receipt: 50
};
async function checkAndIncrementUsage(supabase, userId, type) {
    const month = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
    ;
    // Get plan
    const { data: planRow } = await supabase.from('user_plans').select('plan, pro_expires_at').eq('user_id', userId).single();
    const isPro = planRow?.plan === 'pro' && (!planRow.pro_expires_at || new Date(planRow.pro_expires_at) > new Date());
    // Pro users: always allowed, no increment needed for limits
    if (isPro) {
        // Still track usage for analytics
        await supabase.rpc('increment_ai_usage', {
            p_user_id: userId,
            p_month: month,
            p_type: type
        });
        return {
            allowed: true,
            used: 0,
            limit: Infinity,
            remaining: Infinity,
            isPro: true
        };
    }
    // Get or create usage row
    const { data: usage } = await supabase.from('ai_usage').select('*').eq('user_id', userId).eq('month', month).single();
    const col = `${type}_count`;
    const used = usage?.[col] ?? 0;
    const limit = FREE_LIMITS[type];
    if (used >= limit) {
        return {
            allowed: false,
            used,
            limit,
            remaining: 0,
            isPro: false
        };
    }
    // Increment
    if (usage) {
        await supabase.from('ai_usage').update({
            [col]: used + 1
        }).eq('user_id', userId).eq('month', month);
    } else {
        await supabase.from('ai_usage').insert({
            user_id: userId,
            month,
            [`${type}_count`]: 1
        });
    }
    return {
        allowed: true,
        used: used + 1,
        limit,
        remaining: limit - used - 1,
        isPro: false
    };
}
async function getUsageStatus(supabase, userId) {
    const month = new Date().toISOString().slice(0, 7);
    const [{ data: planRow }, { data: usage }] = await Promise.all([
        supabase.from('user_plans').select('plan, pro_expires_at').eq('user_id', userId).single(),
        supabase.from('ai_usage').select('*').eq('user_id', userId).eq('month', month).single()
    ]);
    const isPro = planRow?.plan === 'pro' && (!planRow.pro_expires_at || new Date(planRow.pro_expires_at) > new Date());
    const make = (type)=>{
        const col = `${type}_count`;
        const used = usage?.[col] ?? 0;
        const limit = FREE_LIMITS[type];
        return isPro ? {
            allowed: true,
            used,
            limit: Infinity,
            remaining: Infinity,
            isPro: true
        } : {
            allowed: used < limit,
            used,
            limit,
            remaining: Math.max(0, limit - used),
            isPro: false
        };
    };
    return {
        chat: make('chat'),
        insights: make('insights'),
        receipt: make('receipt'),
        isPro
    };
}
}),
"[project]/app/api/usage/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2d$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/ai-usage.ts [app-route] (ecmascript)");
;
;
async function GET() {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', {
        status: 401
    });
    const usage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$ai$2d$usage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsageStatus"])(supabase, user.id);
    return Response.json(usage);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__863b04e3._.js.map