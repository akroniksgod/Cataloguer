import {TabProps} from "../types/AppTypes";

/**
 * Перечисление ссылок табов.
 */
export enum TabLink {
    NONE = "/",
    BROCHURES = "/brochures",
    AUDIT = "/audit",
}

/**
 * Все ссылки для проверки.
 */
export const ALL_LINKS: Readonly<TabLink[]> = [TabLink.AUDIT, TabLink.BROCHURES, TabLink.NONE];

/**
 * Перечисление табов.
 */
export enum TabKey {
    NONE = "main_tab_none",
    BROCHURES = "main_tab_brochures",
    AUDIT = "main_tab_loggs",
}

/**
 * Вкладки меню первого уровня.
 */
export const TABS: Readonly<TabProps[]> = [
    {label: "Каталоги", key: TabKey.BROCHURES, link: TabLink.BROCHURES},
    {label: "Аудит", key: TabKey.AUDIT, link: TabLink.AUDIT}
];