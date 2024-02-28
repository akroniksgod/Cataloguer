import BaseButton from "../BaseButtonComponent";
import React from "react";
import {DatePicker, Form, Input} from "antd";
import {BaseStoreInjector, EditBrochureHandlerProps} from "../../../types/BrochureTypes";
import {inject, observer} from "mobx-react";
import GoodsTableComponent from "./EditableTable/GoodsTableComponent";
import {cerr, getValidator} from "../../../Utils";
import {openNotification} from "../../NotificationComponent";
import GoodsStore from "../../../stores/GoodsStore";
import dayjs from "dayjs";
import locale from 'antd/es/date-picker/locale/ru_RU';
import 'dayjs/locale/ru';
import {
    ButtonModes,
    CREATE_FORM_METADATA,
    CREATE_GOODS_FORM_METADATA,
    EDIT_FORM_METADATA,
    MetadataTypes,
    BUTTON_MODES
} from "../../../constants/CreateBrochureButtonConstants";
import {MetadataProps} from "../../../types/OperationsTypes";

/**
 * Свойства компонента CreateBrochureButtonComponent.
 * @param mode Режим работы кнопок компонента.
 * @param goodsStore Хранилище каталогов.
 */
interface CreateBrochureButtonComponentProps extends BaseStoreInjector {
    mode: ButtonModes;
    goodsStore?: GoodsStore;
}

/**
 * Компонент кнопки Создать/Изменить, открывающий свою модалку.
 */
const CreateBrochureButtonComponent: React.FC<CreateBrochureButtonComponentProps> = inject("brochureStore", "goodsStore")(observer((props) => {
    /**
     * Текущий режим.
     */
    const currentMode = BUTTON_MODES.get(props.mode) ?? "";

    /**
     * Указатель на форму.
     */
    const [form] = Form.useForm();

    /**
     * Возвращает компонет элемента формы.
     * @param formItem Элемент формы.
     */
    const getFormItemComponent = (formItem: MetadataProps) => {
        switch (formItem.type) {
            case MetadataTypes.NMBR_FIELD: return (<Input placeholder={formItem.name} type={"number"}/>);
            case MetadataTypes.STR_FIELD: return (<Input placeholder={formItem.name}/>);
            case MetadataTypes.DATE_FIELD: return (<DatePicker style={{width: "100%"}} format={"DD.MM.YYYY"} locale={locale}/>);
            case MetadataTypes.TBL_FIELD: return (<GoodsTableComponent/>);
            default: return null;
        }
    };

    /**
     * Возвращает метаданные для формы.
     */
    const getFormMetaData = (): readonly MetadataProps[] => {
        switch (props.mode) {
            case ButtonModes.CREATE: return CREATE_FORM_METADATA;
            case ButtonModes.EDIT: return EDIT_FORM_METADATA;
            case ButtonModes.CREATE_GOODS: return CREATE_GOODS_FORM_METADATA;
            default: return [];
        }
    };

    /**
     * Возвращает идентификатор формы.
     */
    const getFormId = (): string => {
        let operation;
        switch (props.mode) {
            case ButtonModes.CREATE: operation = "create"; break;
            case ButtonModes.EDIT: operation = "edit"; break;
            case ButtonModes.CREATE_GOODS: operation = "goods_create"; break;
            default: operation = "";
        }
        return `${operation}_form`;
    };

    /**
     * Возвращает компонент формы.
     */
    const getForm = (): React.JSX.Element => {
        const metadata = getFormMetaData();
        const formId = getFormId();
        return (
            <Form id={formId} form={form} name={formId} layout={"vertical"} colon={false}>
                {metadata.map(formItem => {
                    const formItemName: Readonly<string> = formItem.id.slice(formItem.id.indexOf('_') + 1);
                    const defaultValue = formItemName === "date" ? dayjs(formItem.defaultValue) : formItem.defaultValue;
                    return (
                        <Form.Item
                            key={formItem.id}
                            label={formItem.name}
                            name={formItemName}
                            initialValue={defaultValue}
                            help={formItem.helpText}
                            rules={[{
                                required: formItem.isRequired,
                                validator: (_, value) => getValidator(_, value, formItem),
                            }]}
                        >
                            {getFormItemComponent(formItem)}
                        </Form.Item>
                    );
                })}
            </Form>
        );
    };

    /**
     * Обработчик создания/редактирования каталога.
     * @param values Значения полей.
     */
    const handleDbAction = (values: any) => {
        values.date = dayjs(values?.date).format();
        values.edition = parseFloat(values.edition);

        let response;
        switch (props.mode) {
            case ButtonModes.CREATE: {
                response = props.brochureStore?.handleCreateBrochure(values);
            } break;
            case ButtonModes.EDIT: {
                const brochureEditProps: EditBrochureHandlerProps = {
                    name: values.name,
                    date: values.date,
                    edition: values.edition
                };
                response = props.brochureStore?.handleEditBrochure(brochureEditProps);
            } break;
            case ButtonModes.CREATE_GOODS: {
                const callback = props.goodsStore?.updateCurrentBrochureGoods;

                response = callback ?
                    props.brochureStore?.handleUpdateBrochureGoods(callback)
                    : Promise.reject("Ошибка с хранилищем товаров");
            } break;
        }

        response?.then(
            (resolve: string) => {openNotification("Успех", resolve, "success")},
            (error: string) => {openNotification("Ошибка", error, "error")}
        ).finally(() => form.resetFields());
    };

    /**
     * Обрабатывает нажатие кнопки сохранить.
     */
    const onOkClick = (): Promise<void> => {
        return form.validateFields()
                                .then(
                                    (values) => {
                                        handleDbAction(values);
                                        return Promise.resolve();
                                    },
                                    (error) => {
                                        cerr(`Validate Failed: ${error}`);
                                        return Promise.reject();
                                    }
                                );
    };

    /**
     * Обрабатывает нажатие кнопки отменить.
     */
    const onCancelClick = (): Promise<void> => {
        form.resetFields();
        return Promise.resolve();
    };

    /**
     * Возвращает заголовок модального окна.
     */
    const getModalTitle = (): string => {
        switch (props.mode) {
            case ButtonModes.CREATE: return "Создать каталог";
            case ButtonModes.EDIT: return "Редактировать каталог";
            case ButtonModes.CREATE_GOODS: return "Добавить товар";
            default: return "";
        }
    };

    /**
     * Свойства модального окна.
     */
    const modalProps = {
        title: getModalTitle(),
        form: form,
        okText: "Сохранить",
        cancelText: "Отменить",
        onOkClick: onOkClick,
        onCancelClick: onCancelClick,
        children: getForm(),
    };

    /**
     * Заполняет поля каталога.
     */
    const fillBrochureFields = () => {
        if (currentBrochure === null) return;

        form.setFieldsValue({
            id: currentBrochure.id,
            name: currentBrochure.name,
            date: dayjs(currentBrochure.date),
            edition: currentBrochure?.edition,
        });
    };

    /**
     * Заполняет поля товаров.
     */
    const fillGoodsFields = async() => {
        if (currentBrochure === null) return;
        const id = currentBrochure.id ?? -1;
        await props.brochureStore?.updateGoodsList(id);
    };

    /**
     * Заполняет поля данными текалога.
     */
    const fillFieldsOnEdit = (): void => {
        switch (props.mode) {
            case ButtonModes.EDIT: fillBrochureFields(); return;
            case ButtonModes.CREATE_GOODS: fillGoodsFields(); return;
            default: return;
        }
    };

    /**
     * Срабатывает при нажатии кнопки.
     * Используется в качестве callback функции в родительском компоненте.
     */
    const onClick = () => {
        props.mode === ButtonModes.CREATE && props.brochureStore?.updateGoodsList();
        (props.mode === ButtonModes.EDIT || props.mode === ButtonModes.CREATE_GOODS) && fillFieldsOnEdit();
    };

    /**
     * Выбранный каталог.
     */
    const currentBrochure = props.brochureStore?.currentBrochure ?? null;

    /**
     * Возвращает настройки хинта.
     */
    const getTooltipProps = () => {
        let title = "";
        switch (props.mode) {
            case ButtonModes.CREATE:
            case ButtonModes.EDIT:
            case ButtonModes.CREATE_GOODS: title = "Необходимо выбрать каталог"; break;
            default: break;
        }

        return {title: title};
    };

    /**
     * Свойства кнопки для родительского компонента.
     */
    const buttonProps = {
        buttonText: currentMode,
        onClick: onClick,
        isDisabled: currentBrochure === null && props.mode === ButtonModes.EDIT,
        tooltip: getTooltipProps(),
    };

    return (
        <BaseButton
            buttonProps={buttonProps}
            modalProps={modalProps}
        />
    );
}));

export default CreateBrochureButtonComponent;