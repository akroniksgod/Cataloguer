/**
 * Перечисление для вкладок.
 * @param NONE Влкдка не выбрана.
 * @param BROCHURE_TAB Вкладка каталога.
 * @param DISTRIBUTION_TAB Вкладка рассылки.
 * @param GOODS_TAB Вкладка товаров.
 * @param RUN_TAB Вкладка расчёта.
 */
export enum TabKeys {
    NONE = "brochure_empty_tab",
    BROCHURE_TAB = "brochure_description_tab",
    DISTRIBUTION_TAB = "distribution_description_tab",
    GOODS_TAB = "goods_description_tab",
    RUN_TAB = "run_description_tab",
}

/**
 * Перечисление ссылок для вкладок.
 * @param NONE Пустая ссылка.
 * @param BROCHURE Ссылка каталога.
 * @param DISTRIBUTION Ссылка рассылки.
 * @param GOODS Ссылка товаров.
 * @param RUN Ссылка расчёта.
 */
export enum TabLinks {
    NONE = "/",
    BROCHURE = "overview",
    DISTRIBUTION = "distribution",
    GOODS = "goods",
    RUN = "run",
}

/**
 * Словарь вкладок.
 */
export const TABS_MAP = new Map<TabKeys, TabLinks>([
    [TabKeys.NONE, TabLinks.NONE],
    [TabKeys.BROCHURE_TAB, TabLinks.BROCHURE],
    [TabKeys.DISTRIBUTION_TAB, TabLinks.DISTRIBUTION],
    [TabKeys.GOODS_TAB, TabLinks.GOODS],
    [TabKeys.RUN_TAB, TabLinks.RUN],
])