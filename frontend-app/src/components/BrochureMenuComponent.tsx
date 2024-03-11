import React, {useEffect, useState} from "react";
import {Empty, Menu, Space, Spin} from "antd";
import type { MenuProps } from 'antd';
import "../styles/BrochureMenu.css";
import {inject, observer} from "mobx-react";
import {BaseStoreInjector} from "../types/BrochureTypes";
import StatusIconsComponent from "./IconsComponent";
import {getFirstLevelLink} from "../Utils";
import {useLocation, useParams} from "react-router-dom";

/**
 * Свойства компонента BrochureMenuComponent.
 * @property brochureStore Хранилище данных по каталогам.
 */
interface BrochureMenuComponentProps extends BaseStoreInjector {
}

/**
 * Компонент меню каталогов.
 */
const BrochureMenuComponent: React.FC<BrochureMenuComponentProps> = inject("brochureStore")(observer((props) => {
    /**
     * Хук для хранения коллекции элементов меню.
     */
    const [brochureItems, setBrochureItems] = useState<MenuProps['items']>([]);

    /**
     * Данные адресной строки.
     */
    const location = useLocation();

    /**
     * Параметр из адресной строки.
     * Идентификатор сценария.
     */
    const {brochureId, subRoute} = useParams();

    /**
     * Загружает каталог из настроек браузера.
     */
    const setSelectedBrochureOnLoad = (loadedBrochureId?: string): void => {
        const preBrochure = props.brochureStore?.getSavedBrochure() ?? null;
        let id = -1;

        if (loadedBrochureId) {
            id = parseInt(loadedBrochureId);
        } else if (preBrochure !== null) {
            id = preBrochure.id;
        }

        if (id === -1) return;
        onSelectBrochure({key: `brochure_${id}`});
    };

    /**
     * Хук, вызывающий запрос на загрузку каталогов при монтировании компонента в DOM.
     * Загружает каталоги из БД.
     */
    useEffect(() => {
        props.brochureStore?.loadBrochures();
        setSelectedBrochureOnLoad(brochureId);
    }, []);

    /**
     * Возвращает компонент span для элемента меню.
     * @param name Название каталога.
     * @param status Статус каталога.
     * @param potentialIncome Потенциальный доход с каталога, характеризующий эффективность.
     */
    const getMenuItemSpan = (name: string, status: string, potentialIncome: number) => {
        return (
            <span className={"brochure-menu-items-style"}>
                <Space>
                    <StatusIconsComponent status={status} potentialIncome={potentialIncome}/>{name}
                </Space>
            </span>
        );
    };

    /**
     * Хук, необходимый для преобразования каталогов и элементы, подходящие под компонент Menu.
     */
    useEffect(() => {
        const brochures = props.brochureStore?.brochures ?? [];
        setBrochureItems(
            brochures.map(brochure => {
                return ({
                    label: getMenuItemSpan(
                        brochure.name ?? `Каталог ${brochure.id}`,
                        brochure.statusName,
                        brochure.potentialIncome
                    ),
                    key: `brochure_${brochure.id}`,
                });
            })
        );
    }, [props.brochureStore?.brochures]);

    /**
     * Изменяет данные на странице.
     * Добавляет текущее состояние в history.
     * @param brochureId Идентификатор каталога.
     */
    const updatePushState = (brochureId: number) => {
        const link = getFirstLevelLink(location.pathname);
        const innerObject = {brochureId: brochureId, subRoute: subRoute};
        const baseUrl = `${link}/${brochureId}`;
        const url = !subRoute ? baseUrl : `${baseUrl}/${subRoute}`;
        window.history.pushState({...window.history.state, ...innerObject}, "", url);
    };

    /**
     * Изменяет выбранный каталог.
     * @param event Событие, содержащее данные по каталогу.
     */
    const onSelectBrochure = (event: {key: string}): void => {
        const brochureKey: string = event.key ?? "";
        const id = brochureKey.slice(brochureKey.indexOf('_') + 1);
        updatePushState(id !== "undefined" ? parseInt(id) : -1);
        props.brochureStore?.onBrochureClick(id !== "undefined" ? parseInt(id) : -1, subRoute);
    };

    /**
     * Выбранные элементы меню.
     */
    const [currentlySelectedMenuItems, setCurrentlySelectedMenuItems] = useState<string[]>([]);

    /**
     * Хук, обновляющий выбранный элемент в меню.
     */
    useEffect(() => {
        setCurrentlySelectedMenuItems(props.brochureStore?.getSavedBrochureMenu() ?? []);
    }, [props.brochureStore?.currentBrochure]);

    return (
        <Spin className={"white-background-style"} spinning={props.brochureStore?.isBrochureMenuLoading}>
            {brochureItems && brochureItems.length > 0 ?
                <Menu
                    className={"brochure-menu-style"}
                    mode={"inline"}
                    selectedKeys={currentlySelectedMenuItems}
                    items={brochureItems}
                    onClick={onSelectBrochure}
                />
            : <Empty
                className={"empty-menu-style"}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={"Нет каталогов"}
            />}
        </Spin>
    );
}));

export default BrochureMenuComponent;