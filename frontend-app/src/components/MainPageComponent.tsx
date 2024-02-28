import '../styles/App.css';
import React, {useCallback, useEffect, useState} from "react";
import {ConfigProvider, Layout, Tabs, Typography} from "antd";
import {Header} from 'antd/es/layout/layout';
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {ALL_LINKS, TabKey, TabLink, TABS} from "../constants/MainPageComponentConstants";

/**
 * Стартовый компонент.
 */
const MainPageComponent = () => {
    /**
     * Данные адресной строки.
     */
    const location = useLocation();

    /**
     * Хук для переадресации.
     */
    const navigate = useNavigate();

    /**
     * Выполняет переадресацию.
     */
    const redirectTo = useCallback((link: string) => navigate(link, {replace: true}), [navigate]);

    /**
     * Возвращает ключ исходного раздела.
     */
    const getInitialTabKey = useCallback(() => {
        const link = location.pathname;
        return TABS.find(tab => tab.link === link)?.key ?? TabKey.NONE;
    }, []);

    /**
     * Текущая вкладка.
     */
    const [currentTab, setCurrentTab] = useState<string>(getInitialTabKey());

    /**
     * Изменяет данные на странице.
     * Добавляет текущее состояние в history.
     * @param tabKey Ключ раздела.
     * @param title Заголовок.
     * @param link Ссылка.
     */
    const updatePushState = (tabKey: string, title: string, link: string) => {
        window.history.pushState({tabKey, title, link}, title, link);
        redirectTo(link);
    };

    /**
     * Изменяет данные на странице.
     * Добавляет текущее состояние в history.
     * @param tabKey Ключ раздела.
     * @param title Заголовок.
     * @param link Ссылка.
     */
    const updateReplaceState = (tabKey: string, title: string, link: string) => {
        window.history.replaceState({tabKey, title, link}, title, link);
        redirectTo(link);
    };

    /**
     * Изменяет выбранную вкладку
     * @param tab Ключ вкладки.
     */
    const updateTab = (tab: string) => {
        if (tab === currentTab) return;

        setCurrentTab(tab);
        const link = TABS.find(thisTab => thisTab.key === tab)!.link;
        updatePushState(tab, "", link);
    };

    /**
     * Возвращает гарантированно рабочую ссылку.
     * @param pathname Путь в адресной строке.
     */
    const getProperLink = (pathname: string): string => {
        return ALL_LINKS.find(link => pathname.includes(link)) ?? TabLink.NONE;
    };

    /**
     * Возвращает гарантированно рабочий ключ раздела.
     * @param pathname Путь в адресной строке.
     */
    const getProperKey = (pathname: string) => {
        switch (getProperLink(pathname)) {
            case TabLink.AUDIT: return TabKey.AUDIT;
            case TabLink.BROCHURES: return TabKey.BROCHURES;
            case TabLink.NONE:
            default: return TabKey.NONE;
        }
    };

    /**
     * Выполняет переадресацию на страницу со сценариями,
     * если был вызван корень сайта.
     */
    const referToBrochuresIfPageRootIsCalled = () => {
        if (currentTab !== TabKey.NONE) return;
        updateReplaceState(TabKey.BROCHURES, "", TabLink.BROCHURES);
    };

    /**
     * Обновляет выбранную вкладку в меню.
     */
    useEffect(() => {
        const key = getProperKey(location.pathname);
        setCurrentTab(key);
        referToBrochuresIfPageRootIsCalled();
    }, [location.pathname]);

    /**
     * Обрабатывает событие нажатия на стрелочку назад в браузере.
     * @param event Событие.
     */
    const onPopStateEvent = (event: PopStateEvent) => {
        if (!event) return;
        const state = event.state;
        const {tabKey, link} = state;

        if (tabKey && link) {
            setCurrentTab(tabKey);
            redirectTo(link);
            return;
        }
    };

    /**
     * Подписывает события компонента.
     */
    useEffect(() => {
        window.addEventListener('popstate', onPopStateEvent, false);

        return () => {
            window.removeEventListener('popstate', onPopStateEvent);
        };
    }, []);

    return (
        <Layout className={"white-background-style"}>
            <Header className={"main-window-header"}>
                <Typography.Title className={"header-title"}>
                    Формирование эффективного каталога товаров
                </Typography.Title>
                <ConfigProvider theme={{
                    token: {
                        colorPrimary: 'black',
                        colorPrimaryHover: 'white',
                    }}}
                >
                    <Tabs
                        className={"main-tabs-style"}
                        activeKey={currentTab}
                        onChange={updateTab}
                        items={TABS.map(tab => tab)}
                    />
                </ConfigProvider>
            </Header>
            <Layout className={"main-window-layout"}>
                <Outlet/>
            </Layout>
        </Layout>
    );
};

export default MainPageComponent;
