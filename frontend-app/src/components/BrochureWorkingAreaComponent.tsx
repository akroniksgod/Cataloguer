import React, {useCallback, useEffect, useState} from "react";
import {Layout, Tabs, Typography} from "antd";
import {Content, Header} from "antd/es/layout/layout";
import "../styles/BrochureWorkingArea.css"
import BrochureDescriptionComponent from "./Tabs/BrochureNestedTabs/BrochureDescriptionComponent";
import DistributionDescriptionComponent from "./Tabs/BrochureNestedTabs/DistributionDescriptionComponent";
import GoodsDescriptionComponent from "./Tabs/BrochureNestedTabs/GoodsDescriptionComponent";
import {inject, observer} from "mobx-react";
import {BaseStoreInjector, BrochureProps} from "../types/BrochureTypes";
import RunResultComponent from "./Tabs/BrochureNestedTabs/RunResultComponent";
import {useLocation} from "react-router-dom";
import {getFirstLevelLink} from "../Utils";

/**
 * Перечисление для вкладок.
 * @param BROCHURE_TAB Вкладка каталога.
 * @param DISTRIBUTION_TAB Вкладка рассылки.
 */
enum TabKeys {
    NONE = "brochure_empty_tab",
    BROCHURE_TAB = "brochure_description_tab",
    DISTRIBUTION_TAB = "distribution_description_tab",
    GOODS_TAB = "goods_description_tab",
    RUN_TAB = "run_description_tab",
}

enum TabLinks {
    NONE = "/",
    BROCHURE = "overview",
    DISTRIBUTION = "distribution",
    GOODS = "goods",
    RUN = "run",
}

/**
 * Свойства компонента BrochureWorkingAreaComponent.
 */
interface BrochureWorkingAreaComponentProps extends BaseStoreInjector {
}

/**
 * Переменная для получения вкладки из хранилища
 */
const SS_SAVED_TAB: Readonly<string> = "ss_saved_tab";

/**
 * Компонент рабочей области каталога.
 */
const BrochureWorkingAreaComponent: React.FC<BrochureWorkingAreaComponentProps> = inject("brochureStore")(observer((props) => {
    /**
     * Выбранный каталог.
     */
    const [brochure, setBrochure] = useState<BrochureProps | null>(null);

    /**
     * Данные адресной строки.
     */
    const location = useLocation();

    /**
     * Множество вкладок.
     */
    const tabs = [
        {
            key: TabKeys.BROCHURE_TAB,
            label: "Каталог",
            link: TabLinks.BROCHURE,
        },
        {
            key: TabKeys.GOODS_TAB,
            label: 'Состав',
            link: TabLinks.GOODS,
        },
        {
            key: TabKeys.DISTRIBUTION_TAB,
            label: 'Рассылка',
            link: TabLinks.DISTRIBUTION,
        },
        {
            key: TabKeys.RUN_TAB,
            label: 'Расчёт',
            disabled: brochure?.potentialIncome === 0,
            link: TabLinks.RUN,
        },
    ];

    /**
     * Возвращает ключ исходного раздела.
     */
    const getInitialTabKey = useCallback(() => {
        const link = location.pathname;
        return tabs.find(tab => tab.link === link)?.key ?? TabKeys.NONE;
    }, []);

    /**
     * Ключ текущей (выбранной) вкладки.
     */
    const [currentTabKey, setCurrentTabKey] = useState<string>(getInitialTabKey());

    /**
     * Изменяет данные на странице.
     * Добавляет текущее состояние в history.
     * @param tabKey Ключ раздела.
     * @param title Заголовок.
     * @param link Ссылка.
     */
    const updatePushState = (tabKey: string, brochureId: number) => {
        const link = getFirstLevelLink(location.pathname);
        const innerObject = {subRoute: tabKey, brochureId: brochureId};
        const currentSubRoute = tabs.find(tab => tab.key === tabKey)?.link ?? TabLinks.NONE;
        window.history.pushState({...window.history.state, ...innerObject}, "", `${link}/${brochureId}/${currentSubRoute}`);
    };

    /**
     * Изменяет данные на странице.
     * Добавляет текущее состояние в history.
     * @param tabKey Ключ раздела.
     * @param title Заголовок.
     * @param link Ссылка.
     */
    const updateReplaceState = (tabKey: string, brochureId: number) => {
        const link = getFirstLevelLink(location.pathname);
        const currentSubRoute = tabs.find(tab => tab.key === tabKey)?.link ?? TabLinks.NONE;
        const innerObject = {subRoute: tabKey};
        window.history.replaceState({...window.history.state, ...innerObject}, "", `${link}/${brochureId}/${currentSubRoute}`);
    };

    /**
     * Возвращает ключ вкладки.
     */
    const getTabKey = () => {
        const oldTab = sessionStorage.getItem(SS_SAVED_TAB);
        return oldTab !== null ? oldTab : TabKeys.BROCHURE_TAB;
    };

    /**
     * Хук для изменения текущей вкладки.
     * При обновлении страницы подставляет выбранную вкладку.
     * При смене каталога устанавливает первую вкладку.
     */
    useEffect(() => {
        const currentBrochure = props.brochureStore?.currentBrochure ?? null;

        setBrochure(prevBrochure => {
            let key: string = TabKeys.BROCHURE_TAB;

            const prevId = prevBrochure?.id ?? -1;
            if (!!currentBrochure) {
                const currentId = currentBrochure.id;
                const areSameBrochures = currentId === prevId;
                const isPrevBrochureNull = prevId === -1;
                if ((!areSameBrochures && isPrevBrochureNull) ||
                        (areSameBrochures && !isPrevBrochureNull)) {
                    key = getTabKey();
                }
                setCurrentTabKey(key);
                updateReplaceState(key, currentBrochure?.id ?? -1);
            }

            return currentBrochure;
        });
    }, [props.brochureStore?.currentBrochure?.id]);

    /**
     * Хук, необходимый для изменения базовых данных о каталоге при изменении хотя бы одного поля.
     */
    useEffect(() => setBrochure(props.brochureStore?.currentBrochure ?? null), [props.brochureStore?.currentBrochure]);

    /**
     * Измемняет ключ текущей вкладки.
     * @param tabKey Ключ вкладки.
     */
    const onTabChange = (tabKey: string): void => {
        setCurrentTabKey(tabKey);
        sessionStorage.setItem(SS_SAVED_TAB, tabKey);
        updatePushState(tabKey, brochure?.id ?? -1);
    };

    /**
     * Возвращает компонент для соответвующей вкладки.
     */
    const getTabContent = () => {
        switch (currentTabKey) {
            case TabKeys.BROCHURE_TAB: return (<BrochureDescriptionComponent/>);
            case TabKeys.DISTRIBUTION_TAB: return (<DistributionDescriptionComponent/>);
            case TabKeys.GOODS_TAB: return (<GoodsDescriptionComponent/>);
            case TabKeys.RUN_TAB: return (<RunResultComponent/>);
            default: return null;
        }
    };

    /**
     * Возвращает базовую информацию для строки над табами.
     */
    const getBrochureBaseInfo = (): string => {
        if (brochure === null) return "";

        const {name, edition, statusName, potentialIncome} = brochure;
        return `${name} \\ ${edition} \\ ${potentialIncome} \\ ${statusName}`;
    };

    /**
     * Обрабатывает событие нажатия на стрелочку назад в браузере.
     * @param event Событие.
     */
    const onPopStateEvent = (event: PopStateEvent) => {
        if (!event) return;
        const state = event.state;
        const {subRoute, brochureId} = state;

        if ((brochureId || brochureId === 0) && subRoute) {
            setCurrentTabKey(subRoute);
            props.brochureStore?.onBrochureClick(brochureId);
            return;
        }

        if (!brochureId && !subRoute) {
            setCurrentTabKey(TabKeys.NONE);
            props.brochureStore?.reset();
        }
    };

    /**
     * Подписывает события компонента.
     */
    useEffect(() => {
        window.addEventListener("popstate", onPopStateEvent, false);

        return () => {
            window.removeEventListener("popstate", onPopStateEvent);
        };
    }, []);

    return (
        <Layout className={"white-background-style"}>
            <Header className={"brochure-area-header-style"}>
                <Typography.Paragraph className={"paragraph-header-style"}>
                    {getBrochureBaseInfo()}
                </Typography.Paragraph>
                <Tabs activeKey={currentTabKey} onTabClick={onTabChange} items={tabs.map(tab => tab)}/>
            </Header>
            <Content className={"brochure-area-content-style"}>
                {getTabContent()}
            </Content>
        </Layout>
    );
}));

export default BrochureWorkingAreaComponent;