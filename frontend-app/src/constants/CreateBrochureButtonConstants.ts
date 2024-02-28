import {MetadataProps} from "../types/OperationsTypes";

/**
 * Режимы кнопок компонента.
 * @param CREATE Создание каталога.
 * @param EDIT Редактирование каталога.
 * @param CREATE_GOODS Создание товара.
 */
export enum ButtonModes {
    CREATE,
    EDIT,
    CREATE_GOODS
}

/**
 * Словарь с режимами.
 * @param CREATE Создание каталога.
 * @param EDIT Редактирование каталога.
 * @param CREATE_GOODS Создание товара.
 */
export const BUTTON_MODES = new Map([
    [ButtonModes.CREATE, "Создать"],
    [ButtonModes.EDIT, "Изменить"],
    [ButtonModes.CREATE_GOODS, "Добавить"],
]);

/**
 * Перечисления типов в метаданных для компонента CreateBrochureButtonComponent.
 */
export enum MetadataTypes {
    STR_FIELD,
    NMBR_FIELD,
    TBL_FIELD,
    DATE_FIELD,
    LIST_FIELD,
}

/**
 * Метаданные модалки редактирования каталога.
 */
export const EDIT_FORM_METADATA: Readonly<MetadataProps[]> = [
    {
        id: "brochure_name",
        name: "Название",
        type: MetadataTypes.STR_FIELD,
        isRequired: true,
        min: 1,
        max: 30,
        helpText: "Значение по длине не более 30 символлов"
    },
    {
        id: "brochure_date",
        name: "Период выпуска каталога",
        type: MetadataTypes.DATE_FIELD,
        isRequired: true,
        defaultValue: new Date().toISOString()
    },
    {
        id: "brochure_edition",
        name: "Тираж",
        type: MetadataTypes.NMBR_FIELD,
        isRequired: true,
        min: 1,
        max: 10_000,
        defaultValue: "500",
        helpText: "Значение не более 10 000"
    },
];

/**
 * Метаданные для формы создания товаров.
 */
export const CREATE_GOODS_FORM_METADATA: Readonly<MetadataProps[]> = [
    {id: "brochure_positions", name: "Перечень товаров", type: MetadataTypes.TBL_FIELD, isRequired: false},
];

/**
 * Метаданные создания каталога.
 */
export const CREATE_FORM_METADATA: Readonly<MetadataProps[]> = [
    ...EDIT_FORM_METADATA,
    ...CREATE_GOODS_FORM_METADATA,
];