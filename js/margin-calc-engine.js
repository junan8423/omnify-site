/**
 * Omnify 마진 시뮬레이션 엔진
 * 정의:
 *  - 매출총이익(GM)     = (매출 − 매출원가) / 매출
 *  - 채널 공헌이익       = (매출 − 원가 − 채널수수료 − 물류 − PG − 반품손실) / 매출
 *  - 광고 후 마진        = (공헌이익액 − 광고비) / 매출
 *  - 통합               = 채널 매출 비중 가중평균
 */
(function (root) {
    'use strict';

    var STORAGE_KEY = 'omnify_margin_calc_v1';
    var APPLY_KEY = 'omnify_margin_calc_apply';

    /** 채널별 전형 비용 힌트(%) — 정산서로 교체 전 시뮬레이션용 */
    var FEE_DEFAULT = { feePct: 10, logisticsPct: 6, pgPct: 0, returnPct: 3, adPct: 8 };
    var CHANNEL_FEE_HINTS = {
        cafe24: { feePct: 0, logisticsPct: 6, pgPct: 3.2, returnPct: 2, adPct: 7 },
        smartstore: { feePct: 5.5, logisticsPct: 6, pgPct: 0, returnPct: 2.5, adPct: 10 },
        coupang: { feePct: 11, logisticsPct: 7, pgPct: 0, returnPct: 3.5, adPct: 12 },
        gmarket: { feePct: 13, logisticsPct: 6, pgPct: 0, returnPct: 3, adPct: 8 },
        elevenst: { feePct: 12, logisticsPct: 6, pgPct: 0, returnPct: 3, adPct: 8 },
        auction: { feePct: 13, logisticsPct: 6, pgPct: 0, returnPct: 3, adPct: 8 },
        ssg: { feePct: 15, logisticsPct: 5, pgPct: 0, returnPct: 2.5, adPct: 5 },
        lotteon: { feePct: 14, logisticsPct: 5, pgPct: 0, returnPct: 2.5, adPct: 5 },
        interpark: { feePct: 12, logisticsPct: 6, pgPct: 0, returnPct: 3, adPct: 6 },
        ably: { feePct: 12, logisticsPct: 6, pgPct: 0, returnPct: 4, adPct: 10 },
        musinsa: { feePct: 14, logisticsPct: 5, pgPct: 0, returnPct: 3, adPct: 7 },
        oliveyoung: { feePct: 18, logisticsPct: 4, pgPct: 0, returnPct: 2, adPct: 4 },
        zigzag: { feePct: 12, logisticsPct: 6, pgPct: 0, returnPct: 4, adPct: 10 },
        cm29: { feePct: 16, logisticsPct: 5, pgPct: 0, returnPct: 2.5, adPct: 5 },
        brandi: { feePct: 13, logisticsPct: 6, pgPct: 0, returnPct: 4, adPct: 9 },
        wconcept: { feePct: 16, logisticsPct: 5, pgPct: 0, returnPct: 2.5, adPct: 5 },
        hyundai_hmall: { feePct: 18, logisticsPct: 4, pgPct: 0, returnPct: 2, adPct: 4 },
        galleria: { feePct: 18, logisticsPct: 4, pgPct: 0, returnPct: 2, adPct: 4 },
        akmall: { feePct: 16, logisticsPct: 5, pgPct: 0, returnPct: 2.5, adPct: 5 },
        kurly: { feePct: 15, logisticsPct: 8, pgPct: 0, returnPct: 2, adPct: 5 },
        ohouse: { feePct: 12, logisticsPct: 7, pgPct: 0, returnPct: 2.5, adPct: 8 },
        kakao_store: { feePct: 6, logisticsPct: 6, pgPct: 0, returnPct: 2.5, adPct: 9 },
        toss: { feePct: 8, logisticsPct: 6, pgPct: 0, returnPct: 2.5, adPct: 9 },
        aliexpress: { feePct: 8, logisticsPct: 10, pgPct: 0, returnPct: 5, adPct: 6 },
        temu: { feePct: 10, logisticsPct: 10, pgPct: 0, returnPct: 5, adPct: 5 },
        gsshop: { feePct: 20, logisticsPct: 4, pgPct: 0, returnPct: 2, adPct: 3 },
        cjonstyle: { feePct: 20, logisticsPct: 4, pgPct: 0, returnPct: 2, adPct: 3 },
        nsshop: { feePct: 20, logisticsPct: 4, pgPct: 0, returnPct: 2, adPct: 3 },
        youtube_shop: { feePct: 5, logisticsPct: 6, pgPct: 3, returnPct: 3, adPct: 12 },
        instagram_shop: { feePct: 5, logisticsPct: 6, pgPct: 3, returnPct: 3, adPct: 12 },
        other: { feePct: 10, logisticsPct: 6, pgPct: 2, returnPct: 3, adPct: 8 }
    };

    var GROUP_LABELS = {
        core: '핵심',
        market: '종합몰 · 오픈마켓',
        vertical: '패션 · 뷰티',
        department: '백화점 · 프리미엄',
        lifestyle: '장보기 · 리빙 · 소셜',
        special: '글로벌 · 홈쇼핑 · 소셜',
        other: '기타'
    };

    function feeHintFor(id) {
        var h = CHANNEL_FEE_HINTS[id];
        return h ? Object.assign({}, FEE_DEFAULT, h) : Object.assign({}, FEE_DEFAULT);
    }

    /**
     * CHANNEL_CATALOG(또는 동일 스키마) → 프리셋 목록
     * tenant-registry.js의 CHANNEL_CATALOG를 넘기면 등록 채널 전체가 선택 가능
     */
    function buildPresetsFromCatalog(catalog) {
        var list = Array.isArray(catalog) && catalog.length
            ? catalog
            : Object.keys(CHANNEL_FEE_HINTS).map(function (id) {
                return { id: id, label: id, group: 'other' };
            });
        return list.map(function (c) {
            var fees = feeHintFor(c.id);
            return {
                id: c.id,
                label: c.label || c.id,
                group: c.group || 'other',
                groupLabel: GROUP_LABELS[c.group] || c.group || '기타',
                apiTier: c.apiTier || '',
                feePct: fees.feePct,
                logisticsPct: fees.logisticsPct,
                pgPct: fees.pgPct,
                returnPct: fees.returnPct,
                adPct: fees.adPct
            };
        });
    }

    /** @deprecated 호환용 — buildPresetsFromCatalog() 결과와 동일 계열 */
    var CHANNEL_PRESETS = buildPresetsFromCatalog(null);

    function round1(n) {
        if (!isFinite(n)) return 0;
        return Math.round(n * 10) / 10;
    }

    function round0(n) {
        if (!isFinite(n)) return 0;
        return Math.round(n);
    }

    function num(v, fallback) {
        var n = parseFloat(v);
        return isFinite(n) ? n : (fallback == null ? 0 : fallback);
    }

    function pctToRatio(p) {
        return num(p) / 100;
    }

    /**
     * @param {object} input
     * @param {number} input.monthlyRevenue  월 결제매출(원)
     * @param {number} input.cogsPct         매출원가율(%) — 전 채널 공통
     * @param {number} input.fixedCostMonthly 월 고정비(원)
     * @param {number} input.desiredProfitMonthly 월 목표 영업이익(원)
     * @param {string} [input.targetBasis]   'contribution' | 'afterAd'
     * @param {Array}  input.channels
     *   { id, label, sharePct, feePct, logisticsPct, pgPct, returnPct, adPct }
     */
    function compute(input) {
        input = input || {};
        var revenue = Math.max(0, num(input.monthlyRevenue));
        var cogsPct = num(input.cogsPct);
        var fixedCost = Math.max(0, num(input.fixedCostMonthly));
        var desiredProfit = Math.max(0, num(input.desiredProfitMonthly));
        var targetBasis = input.targetBasis === 'afterAd' ? 'afterAd' : 'contribution';
        var rowsIn = Array.isArray(input.channels) ? input.channels : [];

        var shareSum = 0;
        rowsIn.forEach(function (ch) { shareSum += Math.max(0, num(ch.sharePct)); });

        var channels = [];
        var sumSales = 0;
        var sumGrossAmt = 0;
        var sumContribAmt = 0;
        var sumAfterAdAmt = 0;
        var sumAds = 0;
        var sumCogs = 0;
        var sumFees = 0;

        rowsIn.forEach(function (ch) {
            var sharePct = Math.max(0, num(ch.sharePct));
            if (sharePct <= 0 && rowsIn.length > 1) {
                /* skip zero-share rows from blend but keep for UI if needed — still compute with 0 */
            }
            var sales = revenue * pctToRatio(sharePct);
            var cogs = sales * pctToRatio(cogsPct);
            var fee = sales * pctToRatio(ch.feePct);
            var logistics = sales * pctToRatio(ch.logisticsPct);
            var pg = sales * pctToRatio(ch.pgPct);
            var returns = sales * pctToRatio(ch.returnPct);
            var ads = sales * pctToRatio(ch.adPct);

            var grossAmt = sales - cogs;
            var contribAmt = sales - cogs - fee - logistics - pg - returns;
            var afterAdAmt = contribAmt - ads;

            var grossMargin = sales > 0 ? (grossAmt / sales) * 100 : 0;
            var contribMargin = sales > 0 ? (contribAmt / sales) * 100 : 0;
            var afterAdMargin = sales > 0 ? (afterAdAmt / sales) * 100 : 0;

            channels.push({
                id: ch.id || 'ch',
                label: ch.label || ch.id || '채널',
                sharePct: round1(sharePct),
                sales: round0(sales),
                cogs: round0(cogs),
                fee: round0(fee),
                logistics: round0(logistics),
                pg: round0(pg),
                returns: round0(returns),
                ads: round0(ads),
                grossAmt: round0(grossAmt),
                contribAmt: round0(contribAmt),
                afterAdAmt: round0(afterAdAmt),
                grossMargin: round1(grossMargin),
                contribMargin: round1(contribMargin),
                afterAdMargin: round1(afterAdMargin),
                feePct: num(ch.feePct),
                logisticsPct: num(ch.logisticsPct),
                pgPct: num(ch.pgPct),
                returnPct: num(ch.returnPct),
                adPct: num(ch.adPct)
            });

            sumSales += sales;
            sumGrossAmt += grossAmt;
            sumContribAmt += contribAmt;
            sumAfterAdAmt += afterAdAmt;
            sumAds += ads;
            sumCogs += cogs;
            sumFees += fee + logistics + pg + returns;
        });

        var blendGross = sumSales > 0 ? (sumGrossAmt / sumSales) * 100 : 0;
        var blendContrib = sumSales > 0 ? (sumContribAmt / sumSales) * 100 : 0;
        var blendAfterAd = sumSales > 0 ? (sumAfterAdAmt / sumSales) * 100 : 0;

        /* 목표 마진: 고정비+목표이익을 커버하려면 필요한 공헌(또는 광고후) 마진율 */
        var needAmt = fixedCost + desiredProfit;
        var suggestedTarget = revenue > 0 ? (needAmt / revenue) * 100 : 0;
        /* 광고 후 기준이면, 필요액에 이미 광고가 빠지지 않으므로
           광고 후 마진으로 커버 = (공헌 − 광고) 합 ≥ need → 동일 식은 afterAd 기준으로 비교 */
        var seedMargin = targetBasis === 'afterAd' ? blendAfterAd : blendContrib;
        var gap = seedMargin - suggestedTarget;

        var channelMargins = {};
        var channelWeights = {};
        channels.forEach(function (c) {
            if (c.sharePct <= 0) return;
            var baseId = normalizeChannelId(c.id);
            channelMargins[baseId] = targetBasis === 'afterAd' ? c.afterAdMargin : c.contribMargin;
            channelWeights[baseId] = (channelWeights[baseId] || 0) + c.sharePct;
        });

        return {
            definition: {
                gross: '매출총이익 = (결제매출 − 매출원가) ÷ 결제매출',
                contribution: '채널 공헌 = (결제매출 − 원가 − 수수료 − 물류 − PG − 반품) ÷ 결제매출',
                afterAd: '광고 후 = (공헌이익액 − 광고비) ÷ 결제매출',
                blend: '통합 = 채널 매출 비중 가중평균',
                target: '권장 목표 = (월 고정비 + 월 목표이익) ÷ 월 결제매출'
            },
            meta: {
                monthlyRevenue: round0(revenue),
                cogsPct: round1(cogsPct),
                fixedCostMonthly: round0(fixedCost),
                desiredProfitMonthly: round0(desiredProfit),
                targetBasis: targetBasis,
                shareSum: round1(shareSum),
                shareOk: Math.abs(shareSum - 100) < 0.6
            },
            totals: {
                sales: round0(sumSales),
                cogs: round0(sumCogs),
                channelCosts: round0(sumFees),
                ads: round0(sumAds),
                grossAmt: round0(sumGrossAmt),
                contribAmt: round0(sumContribAmt),
                afterAdAmt: round0(sumAfterAdAmt),
                grossMargin: round1(blendGross),
                contribMargin: round1(blendContrib),
                afterAdMargin: round1(blendAfterAd)
            },
            target: {
                needAmt: round0(needAmt),
                suggestedPct: round1(suggestedTarget),
                seedPct: round1(seedMargin),
                gapPct: round1(gap),
                coversFixed: sumContribAmt >= fixedCost,
                coversProfit: (targetBasis === 'afterAd' ? sumAfterAdAmt : sumContribAmt) >= needAmt
            },
            channels: channels,
            applyPayload: {
                version: 1,
                savedAt: new Date().toISOString(),
                targetMargin: round1(suggestedTarget),
                globalSeed: round1(seedMargin),
                targetBasis: targetBasis,
                margins: Object.assign({ global: round1(seedMargin) }, channelMargins),
                channelWeights: channelWeights,
                monthlyRevenue: round0(revenue),
                cogsPct: round1(cogsPct),
                summary: {
                    grossMargin: round1(blendGross),
                    contribMargin: round1(blendContrib),
                    afterAdMargin: round1(blendAfterAd)
                }
            }
        };
    }

    function normalizeChannelId(id) {
        id = String(id || '');
        var idx = id.indexOf('_ch_');
        if (idx > 0) return id.slice(0, idx);
        var known = Object.keys(CHANNEL_FEE_HINTS);
        for (var i = 0; i < known.length; i++) {
            if (id === known[i] || id.indexOf(known[i] + '_') === 0) return known[i];
        }
        return id;
    }

    function defaultInput() {
        return {
            companyName: '',
            monthlyRevenue: 640000000,
            cogsPct: 42,
            fixedCostMonthly: 80000000,
            desiredProfitMonthly: 40000000,
            targetBasis: 'contribution',
            channels: [
                { id: 'cafe24', label: 'Cafe24(자사몰)', sharePct: 55, feePct: 0, logisticsPct: 6, pgPct: 3.2, returnPct: 2, adPct: 7 },
                { id: 'smartstore', label: '네이버 스마트스토어', sharePct: 20, feePct: 5.5, logisticsPct: 6, pgPct: 0, returnPct: 2.5, adPct: 10 },
                { id: 'coupang', label: '쿠팡', sharePct: 25, feePct: 11, logisticsPct: 7, pgPct: 0, returnPct: 3.5, adPct: 12 }
            ]
        };
    }

    function saveLocal(input) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
        } catch (e) { /* ignore */ }
    }

    function loadLocal() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function saveApplyPayload(payload) {
        try {
            localStorage.setItem(APPLY_KEY, JSON.stringify(payload));
        } catch (e) { /* ignore */ }
        return payload;
    }

    function loadApplyPayload() {
        try {
            var raw = localStorage.getItem(APPLY_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function formatWon(n) {
        n = round0(n);
        if (Math.abs(n) >= 100000000) {
            return (n / 100000000).toFixed(2).replace(/\.?0+$/, '') + '억';
        }
        if (Math.abs(n) >= 10000) {
            return Math.round(n / 10000).toLocaleString('ko-KR') + '만';
        }
        return n.toLocaleString('ko-KR') + '원';
    }

    function buildSummaryText(result, companyName) {
        var t = result.totals;
        var tg = result.target;
        var lines = [
            '[Omnify 마진 시뮬레이터 결과]',
            companyName ? '업체: ' + companyName : '',
            '월 결제매출: ' + formatWon(result.meta.monthlyRevenue),
            '원가율: ' + result.meta.cogsPct + '%',
            '',
            '■ 통합 지표',
            '· 매출총이익: ' + t.grossMargin + '%',
            '· 채널 공헌마진: ' + t.contribMargin + '%  (' + formatWon(t.contribAmt) + ')',
            '· 광고 후 마진: ' + t.afterAdMargin + '%  (' + formatWon(t.afterAdAmt) + ')',
            '',
            '■ 목표·시드 (어드민 반영용)',
            '· 권장 목표 마진: ' + tg.suggestedPct + '%  (고정비+목표이익 커버)',
            '· 통합 마진 시드: ' + tg.seedPct + '%  (' + (result.meta.targetBasis === 'afterAd' ? '광고 후' : '공헌') + ' 기준)',
            '· 갭: ' + (tg.gapPct >= 0 ? '+' : '') + tg.gapPct + '%p',
            '',
            '■ 채널별 ' + (result.meta.targetBasis === 'afterAd' ? '광고 후' : '공헌') + ' 마진'
        ];
        result.channels.forEach(function (c) {
            if (c.sharePct <= 0) return;
            var m = result.meta.targetBasis === 'afterAd' ? c.afterAdMargin : c.contribMargin;
            lines.push('· ' + c.label + ' ' + c.sharePct + '% → ' + m + '%');
        });
        lines.push('');
        lines.push('정의: ' + result.definition.contribution);
        return lines.filter(function (l, i, arr) {
            return !(l === '' && arr[i - 1] === '');
        }).join('\n');
    }

    root.OmnifyMarginCalc = {
        STORAGE_KEY: STORAGE_KEY,
        APPLY_KEY: APPLY_KEY,
        CHANNEL_PRESETS: CHANNEL_PRESETS,
        CHANNEL_FEE_HINTS: CHANNEL_FEE_HINTS,
        GROUP_LABELS: GROUP_LABELS,
        feeHintFor: feeHintFor,
        buildPresetsFromCatalog: buildPresetsFromCatalog,
        compute: compute,
        defaultInput: defaultInput,
        saveLocal: saveLocal,
        loadLocal: loadLocal,
        saveApplyPayload: saveApplyPayload,
        loadApplyPayload: loadApplyPayload,
        formatWon: formatWon,
        buildSummaryText: buildSummaryText,
        round1: round1,
        num: num
    };
})(typeof window !== 'undefined' ? window : this);
