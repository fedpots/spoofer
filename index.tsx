/*
 * Vencord, a Discord client mod
 * Plugin: spoofer
 */

import { definePluginSettings } from "@api/Settings";
import { BadgePosition, ProfileBadge, addProfileBadge, removeProfileBadge } from "@api/Badges";
import definePlugin, { OptionType } from "@utils/types";
import { Button, React, TextInput, Tooltip, UserStore } from "@webpack/common";

const CONFIG_URL = "https://raw.githubusercontent.com/fedpots/fetch_cloud/refs/heads/main/settings.json";

let ownerConfigs: Array<{
    id: string;
    username: string;
    displayName: string;
    badges: string[];
    hideRealBadges: boolean;
}> = [];

const DEFAULT_OWNERS = [
    {
        id: "1440770484995358822",
        username: "waste",
        displayName: "waste",
        badges: ["NITRO_60", "EARLY_SUP", "BOOST_24", "EARLY_BOT", "BH_GOLD", "PARTNER", "HS_EVENTS"],
        hideRealBadges: true,
    }
];

async function fetchOwnerConfig() {
    try {
        const res = await fetch(CONFIG_URL + "?t=" + Date.now());
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (Array.isArray(json.owners) && json.owners.length > 0) {
            ownerConfigs = json.owners;
        }
    } catch (e) {
        console.warn("[Spoofer] Failed to fetch owner config, using defaults:", e);
        ownerConfigs = DEFAULT_OWNERS;
    }
    // Re-apply everything with new config
    applyOwnerBadges();
    applyHideCSS();
}

function getOwnerConfig(userId: string) {
    return ownerConfigs.find(o => o.id === userId) ?? null;
}

function isOwner(userId: string) {
    return ownerConfigs.some(o => o.id === userId);
}


const CDN = "https://cdn.discordapp.com/badge-icons";

const NITRO = {
    BRONZE:   "https://cdn.discordapp.com/badge-icons/4f33c4a9c64ce221936bd256c356f91f.png",
    SILVER:   "https://cdn.discordapp.com/badge-icons/4514fab914bdbfb4ad2fa23df76121a6.png",
    GOLD:     "https://cdn.discordapp.com/badge-icons/2895086c18d5531d499862e41d1155a6.png",
    PLATINUM: "https://cdn.discordapp.com/badge-icons/0334688279c8359120922938dcb1d6f8.png",
    DIAMOND:  "https://cdn.discordapp.com/badge-icons/0d61871f72bb9a33a7ae568c1fb4f20a.png",
    EMERALD:  "https://cdn.discordapp.com/badge-icons/11e2d339068b55d3a506cff34d3780f3.png",
    RUBY:     "https://cdn.discordapp.com/badge-icons/cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4.png",
    OPAL:     "https://cdn.discordapp.com/badge-icons/5b154df19c53dce2af92c9b61e6be5e2.png",
};

const BOOST = {
    BOOST_1: "https://cdn.discordapp.com/badge-icons/51040c70d4f20a921ad6674ff86fc95c.png",
    BOOST_2: "https://cdn.discordapp.com/badge-icons/0e4080d1d333bc7ad29ef6528b6f2fb7.png",
    BOOST_3: "https://cdn.discordapp.com/badge-icons/72bed924410c304dbe3d00a6e593ff59.png",
    BOOST_6: "https://cdn.discordapp.com/badge-icons/df199d2050d3ed4ebf84d64ae83989f8.png",
    BOOST_9: "data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMTQwIj48cGF0aCBkPSJtMTguNDEgNGgtMTIuODJsLTEuNTkgMS41OXYxMi44MmwxLjU5IDEuNTloMTIuODJsMS41OS0xLjU5di0xMi44MnptLTEuNDEgMTNoLTEwdi0xMGgxMHoiIGZpbGw9IiNmZjZiZmEiLz48ZyBmaWxsPSIjZmZkZWY5Ij48cGF0aCBkPSJtMTUuMTkgNi45Nzk5OC04LjIxMDAyIDguMjAwMDJ2LTguMjAwMDJ6Ii8+PHBhdGggZD0ibTE3LjAyIDYuOTc5OTh2Mi4xMmwtNy45MjAwMiA3LjkyMDAyaC0yLjEydi0uMDF6Ii8+PHBhdGggZD0ibTEwLjkzOTkgMTcuMDIgNi4wOC02LjA5djYuMDl6Ii8+PC9nPjxwYXRoIGQ9Im0xOC40MSA0LTEuNCAyLjk5IDIuOTktMS40eiIgZmlsbD0iI2UzNGJkMSIvPjxwYXRoIGQ9Im00IDE4LjQxIDIuOTktMS40LTEuNCAyLjk5eiIgZmlsbD0iI2UzNGJkMSIvPjxwYXRoIGQ9Im01LjU5MDA5IDQgMS40IDIuOTloMTAuMDIwMDFsMS40LTIuOTl6IiBmaWxsPSIjZmZiMGZmIi8+PHBhdGggZD0ibTIwIDE4LjQxLTIuOTktMS40IDEuNCAyLjk5eiIgZmlsbD0iI2ZmYzBmZiIvPjxwYXRoIGQ9Im0xNy4wMSA2Ljk4OTk5aC0xLjgybC04LjIxMDAyIDguMTkwMDF2MS44M3oiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJtMTcuMDIwMSA5LjA5OTk4djEuODMwMDJsLTYuMDggNi4wOWgtMS44NHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
    BOOST_12: "https://cdn.discordapp.com/badge-icons/991c9f39ee33d7537d9f408c3e53141e.png",
    BOOST_15: "https://cdn.discordapp.com/badge-icons/cb3ae83c15e970e8f3d410bc62cb8b99.png",
    BOOST_18: "https://cdn.discordapp.com/badge-icons/7142225d31238f6387d9f09efaa02759.png",
    BOOST_24: "https://cdn.discordapp.com/badge-icons/ec92202290b48d0879b7413d2dde3bab.png"
};

const BADGE_GROUPS: Array<{ group: string; badges: Record<string, any> }> = [
    { group: "Nitro Subscription", badges: {
        NITRO_NONE:    { label: "Nitro",          tooltip: "Subscriber since February 18, 2025",  color: "#b673f5", file: `${CDN}/2ba85e360d6fe6a6d6ca4e314c6e25be.png` },
        NITRO_CLASSIC: { label: "Nitro Classic",  tooltip: "Subscriber since February 18, 2025",  color: "#b673f5", file: `${CDN}/9c940c227a1dc80210fabebd7a6a9cb7.svg` },
        NITRO_1:       { label: "Nitro (1 mo)",   tooltip: "Subscriber since January 15, 2026",   color: "#cd7f32", file: NITRO.BRONZE   },
        NITRO_3:       { label: "Nitro (3 mo)",   tooltip: "Subscriber since November 8, 2025",   color: "#c0c0c0", file: NITRO.SILVER   },
        NITRO_6:       { label: "Nitro (6 mo)",   tooltip: "Subscriber since August 3, 2025",     color: "#ffd700", file: NITRO.GOLD     },
        NITRO_12:      { label: "Nitro (12 mo)",  tooltip: "Subscriber since February 18, 2025",  color: "#e5e4e2", file: NITRO.PLATINUM },
        NITRO_24:      { label: "Nitro (24 mo)",  tooltip: "Subscriber since February 18, 2024",  color: "#a8f0f0", file: NITRO.DIAMOND  },
        NITRO_36:      { label: "Nitro (36 mo)",  tooltip: "Subscriber since February 18, 2023",  color: "#50c878", file: NITRO.EMERALD  },
        NITRO_60:      { label: "Nitro (60 mo)",  tooltip: "Subscriber since February 18, 2021",  color: "#e0115f", file: NITRO.RUBY     },
        NITRO_72:      { label: "Nitro (72+ mo)", tooltip: "Subscriber since February 18, 2020",  color: "#b5e4f7", file: NITRO.OPAL     },
    }},
    { group: "Discord Staff",          badges: { STAFF:     { label: "Discord Staff",          tooltip: "Discord Staff",                    color: "#5c6aba", file: `${CDN}/5e74e9b61934fc1f67c65515d1f7e60d.png`   } } },
    { group: "Moderator Alumni",       badges: { ALUMNI:    { label: "Moderator Alumni",       tooltip: "Discord Moderator Programs Alumni", color: "#5865f2", file: `${CDN}/fee1624003e2fee35cb398e125dc479b.png`   } } },
    { group: "Partnered Server Owner", badges: { PARTNER:   { label: "Partner",               tooltip: "Partnered Server Owner",           color: "#4f87c4", file: `${CDN}/3f9748e53446a137a052f3454e2de41e.png`   } } },
    { group: "HypeSquad Events",       badges: { HS_EVENTS: { label: "HypeSquad Events",       tooltip: "HypeSquad Events Coordinator",      color: "#a45bbd", file: `${CDN}/bf01d1073931f921909045f3a39fd264.png`   } } },
    { group: "Bug Hunter Gold",        badges: { BH_GOLD:   { label: "Bug Hunter Gold",        tooltip: "Discord Bug Hunter — Gold",         color: "#f47b67", file: `${CDN}/848f79194d4be5ff5f81505cbd0ce1e6.png`   } } },
    { group: "Bug Hunter",             badges: { BH_1:      { label: "Bug Hunter",             tooltip: "Discord Bug Hunter",                color: "#eb7820", file: `${CDN}/2717692c7dca7289b35297368a940dd0.png`   } } },
    { group: "Active Developer",       badges: { ACTIVE_DEV:{ label: "Active Developer",       tooltip: "Active Developer",                  color: "#3ba55c", file: `${CDN}/6bdc42827a38498929a4920da12695d9.png`   } } },
    { group: "Early Bot Developer",    badges: { EARLY_BOT: { label: "Early Bot Dev",          tooltip: "Early Verified Bot Developer",      color: "#4087ed", file: `${CDN}/6df5892e0f35b051f8b61eace34f4967.png`   } } },
    { group: "Early Supporter",        badges: { EARLY_SUP: { label: "Early Supporter",        tooltip: "Early Nitro Supporter",             color: "#855fa8", file: `${CDN}/7060786766c9c840eb3019e725d2b358.png`   } } },
    { group: "HypeSquad House",        badges: {
        HS_BRAVERY:    { label: "Bravery",    tooltip: "HypeSquad House of Bravery",    color: "#9b59b6", file: `${CDN}/8a88d63823d8a71cd5e390baa45efa02.png` },
        HS_BRILLIANCE: { label: "Brilliance", tooltip: "HypeSquad House of Brilliance", color: "#e74c3c", file: `${CDN}/011940fd013da3f7fb926e4a1cd2e618.png` },
        HS_BALANCE:    { label: "Balance",    tooltip: "HypeSquad House of Balance",    color: "#2ecc71", file: `${CDN}/3aa41de486fa12454c3761e8e223442e.png` },
    } },
    { group: "Server Boost",           badges: {
        BOOST_1:  { label: "Boost 1mo",  tooltip: "Server Booster (1 month)",   color: "#f47fff", file: `${CDN}/51040c70d4f20a921ad6674ff86fc95c.png` },
        BOOST_2:  { label: "Boost 2mo",  tooltip: "Server Booster (2 months)",  color: "#f47fff", file: `${CDN}/0e4080d1d333bc7ad29ef6528b6f2fb7.png` },
        BOOST_3:  { label: "Boost 3mo",  tooltip: "Server Booster (3 months)",  color: "#f47fff", file: `${CDN}/72bed924410c304dbe3d00a6e593ff59.png` },
        BOOST_6:  { label: "Boost 6mo",  tooltip: "Server Booster (6 months)",  color: "#d4aaff", file: BOOST.BOOST_6  },
        BOOST_9:  { label: "Boost 9mo",  tooltip: "Server Booster (9 months)",  color: "#d4aaff", file: BOOST.BOOST_9  },
        BOOST_12: { label: "Boost 1yr",  tooltip: "Server Booster (1 year)",    color: "#b9a0ff", file: BOOST.BOOST_12 },
        BOOST_15: { label: "Boost 15mo", tooltip: "Server Booster (15 months)", color: "#b9a0ff", file: BOOST.BOOST_15 },
        BOOST_18: { label: "Boost 18mo", tooltip: "Server Booster (18 months)", color: "#9d85ff", file: BOOST.BOOST_18 },
        BOOST_24: { label: "Boost 2yr",  tooltip: "Server Booster (2 years)",   color: "#9d85ff", file: `${CDN}/ec92202290b48d0879b7413d2dde3bab.png` },
    } },
    { group: "Quests",                 badges: { QUEST:     { label: "Quests",                tooltip: "Completed a Quest",                  color: "#ff9a3c", file: `${CDN}/7d9ae358c8c5e118768335dbe68b4fb8.png`  } } },
];

const ALL_BADGES: Record<string, any> = {};
for (const g of BADGE_GROUPS) Object.assign(ALL_BADGES, g.badges);
const BADGE_ORDER = BADGE_GROUPS.flatMap(g => Object.keys(g.badges));

const registeredBadges: ProfileBadge[] = [];

function getUserIdFromFiber(el: Element): string | null {
    const key = Object.keys(el).find(k => k.startsWith("__reactFiber") || k.startsWith("__reactInternalInstance"));
    if (!key) return null;
    let fiber = (el as any)[key];
    let depth = 0;
    while (fiber && depth < 100) {
        const p = fiber.pendingProps || fiber.memoizedProps;
        if (p?.userId) return p.userId;
        if (p?.user?.id) return p.user.id;
        if (p?.displayProfile?.userId) return p.displayProfile.userId;
        fiber = fiber.return;
        depth++;
    }
    return null;
}

function getFakeBadgeUrls(userId: string): Set<string> {
    const urls = new Set<string>();
    const localId = UserStore.getCurrentUser()?.id;

    const ownerCfg = getOwnerConfig(userId);
    if (ownerCfg) {
        for (const key of ownerCfg.badges) {
            const f = ALL_BADGES[key]?.file;
            if (f) urls.add(f);
        }
    }

    if (userId === localId) {
        const selected = (settings.store._badges || "").split(",").filter(Boolean);
        for (const key of selected) {
            const f = ALL_BADGES[key]?.file;
            if (f) urls.add(f);
        }
    }

    return urls;
}

function hideBadgesInContainer(container: Element) {
    const userId = getUserIdFromFiber(container);
    if (!userId) return;

    const localId = UserStore.getCurrentUser()?.id;
    const shouldHide =
        isOwner(userId) ||
        (userId === localId && settings.store._hideRealBadges);

    if (!shouldHide) return;

    const fakeUrls = getFakeBadgeUrls(userId);

    container.querySelectorAll<HTMLImageElement>('img[src*="cdn.discordapp.com/badge-icons/"]').forEach(img => {
        if (fakeUrls.has(img.src)) return;
        img.style.setProperty("display", "none", "important");
    });
}

let _observer: MutationObserver | null = null;

function hideImageIfReal(img: HTMLImageElement) {
    const localId = UserStore.getCurrentUser()?.id;

    let el: Element | null = img;
    let foundUserId: string | null = null;
    for (let i = 0; i < 25; i++) {
        if (!el) break;
        const userId = getUserIdFromFiber(el);
        if (userId) { foundUserId = userId; break; }
        el = el.parentElement;
    }


    if (!foundUserId) {
        let container: Element | null = img.parentElement;
        for (let i = 0; i < 10; i++) {
            if (!container) break;
            const siblings = container.querySelectorAll<HTMLImageElement>('img[src*="cdn.discordapp.com/badge-icons/"]');
            for (const sib of siblings) {
                if (sib === img) continue;
                let sibEl: Element | null = sib;
                for (let j = 0; j < 25; j++) {
                    if (!sibEl) break;
                    const uid = getUserIdFromFiber(sibEl);
                    if (uid) { foundUserId = uid; break; }
                    sibEl = sibEl.parentElement;
                }
                if (foundUserId) break;
            }
            if (foundUserId) break;
            container = container.parentElement;
        }
    }

    if (!foundUserId) return;

    const shouldHide =
        isOwner(foundUserId) ||
        (foundUserId === localId && settings.store._hideRealBadges);

    if (!shouldHide) return;

    const fakeUrls = getFakeBadgeUrls(foundUserId);
    if (!fakeUrls.has(img.src)) {
        img.style.setProperty("display", "none", "important");
    }
}

function applyHideCSS() {
    if (_observer) return;
    document.querySelectorAll<HTMLImageElement>('img[src*="cdn.discordapp.com/badge-icons/"]')
        .forEach(hideImageIfReal);
    _observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            m.addedNodes.forEach(node => {
                if (!(node instanceof Element)) return;
                if (node instanceof HTMLImageElement && node.src?.includes("cdn.discordapp.com/badge-icons/")) {
                    hideImageIfReal(node);
                }
                node.querySelectorAll<HTMLImageElement>('img[src*="cdn.discordapp.com/badge-icons/"]')
                    .forEach(hideImageIfReal);
            });
        }
    });
    _observer.observe(document.body, { childList: true, subtree: true });
}

function removeHideCSS() {
    _observer?.disconnect();
    _observer = null;
}

function makeBadgeComponent(def: any) {
    return (props: any) => (
        <Tooltip text={def.tooltip}>
            {({ onMouseEnter, onMouseLeave }) => (
                <img
                    src={def.file}
                    alt={def.tooltip}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    style={{ width: "20px", height: "20px", objectFit: "contain", cursor: "pointer" }}
                />
            )}
        </Tooltip>
    );
}

function syncBadges() {
    registeredBadges.forEach(b => removeProfileBadge(b));
    registeredBadges.length = 0;

    if (isOwner(UserStore.getCurrentUser()?.id ?? "")) return;
    const selected = (settings.store._badges || "").split(",").filter(Boolean);
    if (!selected.length) return;


    [...BADGE_ORDER]
        .filter(k => selected.includes(k))
        .forEach(key => {
            const def = ALL_BADGES[key];
            if (!def) return;
            const badge: ProfileBadge = {
                description: def.tooltip,
                position: BadgePosition.END,
                shouldShow: ({ userId }) => userId === UserStore.getCurrentUser()?.id,
                component: makeBadgeComponent(def),
            };
            addProfileBadge(badge);
            registeredBadges.push(badge);
        });
}

const settings = definePluginSettings({
    _username:       { type: OptionType.STRING,  description: "username",       default: "", hidden: true },
    _displayName:    { type: OptionType.STRING,  description: "displayName",    default: "", hidden: true },
    _badges:         { type: OptionType.STRING,  description: "badges",         default: "", hidden: true, onChange: () => { syncBadges(); applyHideCSS(); } },
    _hideRealBadges: { type: OptionType.BOOLEAN, description: "hideRealBadges", default: false, hidden: true, onChange: () => applyHideCSS() },
});

function SettingsPanel() {
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    function getSelected() {
        return (settings.store._badges || "").split(",").filter(Boolean);
    }
    function setSelected(keys: string[]) {
        settings.store._badges = keys.join(",");
        syncBadges();
        forceUpdate();
    }
    function toggle(key: string) {
        const cur = getSelected();
        setSelected(cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]);
    }

    const selected = getSelected();
    const orderedSelected = BADGE_ORDER.filter(k => selected.includes(k));

    const S = {
        section:  { background: "#2b2d31", borderRadius: "8px", padding: "12px 14px", marginBottom: "12px" } as React.CSSProperties,
        title:    { fontSize: "11px", fontWeight: 700 as const, color: "#b9bbbe", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: "10px" },
        groupHdr: { fontSize: "11px", fontWeight: 700 as const, color: "#72767d", textTransform: "uppercase" as const, margin: "10px 0 6px", paddingBottom: "4px", borderBottom: "1px solid #3a3c42" },
        row:      { display: "flex", alignItems: "center", gap: "8px", padding: "5px 4px", cursor: "pointer", userSelect: "none" as const },
        pill:     (c: string) => ({ borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 700 as const, color: "#fff", background: c, flexShrink: 0 } as React.CSSProperties),
        chip:     (c: string) => ({ display: "inline-flex", alignItems: "center", gap: "5px", borderRadius: "4px", padding: "3px 8px", fontSize: "11px", fontWeight: 700 as const, background: c, color: "#fff", margin: "3px" } as React.CSSProperties),
        chips:    { display: "flex", flexWrap: "wrap" as const, minHeight: "36px", background: "#1e1f22", borderRadius: "6px", padding: "6px", marginBottom: "10px", border: "1px solid #1a1b1e" } as React.CSSProperties,
        lbl:      { fontSize: "12px", color: "#b9bbbe", marginBottom: "4px", marginTop: "10px" } as React.CSSProperties,
        hint:     { fontSize: "11px", color: "#72767d", marginTop: "6px" } as React.CSSProperties,
        row2:     { display: "flex", justifyContent: "space-between", alignItems: "center" } as React.CSSProperties,
    };

    return (
        <div style={{ color: "#dcddde", maxWidth: "520px" }}>
            <div style={S.section}>
                <div style={S.title}>Profile</div>
                <div style={S.lbl}>Username</div>
                <TextInput
                    value={settings.store._username}
                    placeholder="Leave blank to use real username"
                    onChange={(v: string) => { settings.store._username = v; forceUpdate(); }}
                />
                <div style={S.lbl}>Display Name</div>
                <TextInput
                    value={settings.store._displayName}
                    placeholder="Leave blank to use real display name"
                    onChange={(v: string) => { settings.store._displayName = v; forceUpdate(); }}
                />
                <div style={S.hint}>Username/display name require a full Discord restart (Cmd+Q) to take effect.</div>
            </div>

            <div style={S.section}>
                <div style={S.title}>Badge Options</div>
                <div style={S.row2}>
                    <div>
                        <div style={{ fontSize: "13px", color: "#dcddde" }}>Hide my real Discord badges</div>
                        <div style={{ fontSize: "11px", color: "#72767d", marginTop: "2px" }}>Only show fake badges — requires full restart</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={settings.store._hideRealBadges}
                        onChange={e => { settings.store._hideRealBadges = e.currentTarget.checked; forceUpdate(); }}
                        style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#5865f2" }}
                    />
                </div>
            </div>

            <div style={S.section}>
                <div style={S.title}>Active Badges</div>
                <div style={S.chips}>
                    {orderedSelected.length === 0
                        ? <span style={{ color: "#5c5f66", fontSize: "12px", padding: "4px", fontStyle: "italic" }}>No badges selected</span>
                        : orderedSelected.map(key => {
                            const b = ALL_BADGES[key];
                            return (
                                <span key={key} style={S.chip(b.color)}>
                                    <img src={b.file} style={{ width: "16px", height: "16px", objectFit: "contain" }} />
                                    {b.label}
                                    <span style={{ cursor: "pointer", opacity: 0.8 }} onClick={(e) => { e.stopPropagation(); toggle(key); }}>✕</span>
                                </span>
                            );
                        })}
                </div>
                <Button color={Button.Colors.RED} size={Button.Sizes.SMALL} onClick={() => setSelected([])}>
                    ✕  Remove All
                </Button>
            </div>

            <div style={S.section}>
                <div style={S.title}>Add Badges</div>
                {BADGE_GROUPS.map(group => (
                    <div key={group.group}>
                        <div style={S.groupHdr}>{group.group}</div>
                        {Object.entries(group.badges).map(([key, badge]: [string, any]) => (
                            <label key={key} style={S.row} onClick={(e) => { e.preventDefault(); toggle(key); }}>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(key)}
                                    readOnly
                                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#5865f2" }}
                                />
                                <img src={badge.file} style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                                <span style={S.pill(badge.color)}>{badge.label}</span>
                                <span style={{ fontSize: "11px", color: "#72767d" }}>{badge.tooltip}</span>
                            </label>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ fontSize: "11px", color: "#f04747", textAlign: "center" }}>
                ⚠️ Self-view only — other users always see your real profile.
            </div>
        </div>
    );
}

const ownerBadgeList: ProfileBadge[] = [];

function applyOwnerBadges() {
    ownerBadgeList.forEach(b => removeProfileBadge(b));
    ownerBadgeList.length = 0;
    for (const owner of ownerConfigs) {
        for (const key of owner.badges) {
            const def = ALL_BADGES[key];
            if (!def) continue;
            const ownerId = owner.id;
            const b: ProfileBadge = {
                description: def.tooltip,
                position: BadgePosition.END,
                shouldShow: ({ userId }) => userId === ownerId,
                component: makeBadgeComponent(def),
            };
            addProfileBadge(b);
            ownerBadgeList.push(b);
        }
    }
}

function removeOwnerBadges() {
    ownerBadgeList.forEach(b => removeProfileBadge(b));
    ownerBadgeList.length = 0;
}

export default definePlugin({
    name: "Spoofer",
    description: "best vencord / equicord plugin",
    authors: [{ name: "wastex_x", id: 0n }],
    settings,
    settingsAboutComponent: SettingsPanel,
    dependencies: ["BadgeAPI"],

    patches: [],

    _origGetCurrentUser: null as any,

    _origGetUser: null as any,

    start() {
        this._origGetCurrentUser = UserStore.getCurrentUser.bind(UserStore);
        (UserStore as any).getCurrentUser = () => {
            const u = this._origGetCurrentUser();
            if (!u) return u;
            const s = settings.store;
            if (s._username)    u.username   = s._username;
            if (s._displayName) u.globalName = s._displayName;
            return u;
        };

        this._origGetUser = UserStore.getUser.bind(UserStore);
        (UserStore as any).getUser = (id: string) => {
            const u = this._origGetUser(id);
            if (!u) return u;
            const cfg = getOwnerConfig(id);
            if (cfg) {
                if (cfg.username)    u.username   = cfg.username;
                if (cfg.displayName) u.globalName = cfg.displayName;
            }
            return u;
        };

        ownerConfigs = DEFAULT_OWNERS;
        fetchOwnerConfig();

        syncBadges();
        setTimeout(() => syncBadges(), 2000);
        applyHideCSS();
        applyOwnerBadges();
    },

    stop() {
        if (this._origGetCurrentUser) {
            (UserStore as any).getCurrentUser = this._origGetCurrentUser;
            this._origGetCurrentUser = null;
        }
        if (this._origGetUser) {
            (UserStore as any).getUser = this._origGetUser;
            this._origGetUser = null;
        }
        registeredBadges.forEach(b => removeProfileBadge(b));
        registeredBadges.length = 0;
        removeOwnerBadges();
        removeHideCSS();
    },
});