import '../styles/App.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import MainPageComponent from "./MainPageComponent";
import {Result} from "antd";
import {TabLink} from "../constants/MainPageComponentConstants";
import AuditTabContentComponent from "./Tabs/AuditTabContentComponent";
import BrochureTabContent from './Tabs/BrochureTabContentComponent';

/**
 * Список маршрутов приложения.
 */
const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <MainPageComponent/>
        ),
        children: [
            {
                path: `${TabLink.BROCHURES}`,
                element: <BrochureTabContent/>,
                children: [
                    {
                        path: `:brochureId`,
                        element: <BrochureTabContent/>,
                        children: [
                            {
                                path: `:subRoute`,
                                element: <BrochureTabContent/>,
                            },
                        ]
                    },
                ]
            },
            {
                path: `${TabLink.AUDIT}`,
                element: <AuditTabContentComponent/>,
            },
        ]
    },
    {
        path: "*",
        element: (
            <Result
                status={"404"}
                title={"404"}
                subTitle={"Данная страница не существует."}
            />
        ),
    },
]);

/**
 * Стартовый компонент.
 */
const App = () => {
    return (
        <RouterProvider router={router} />
    );
};

export default App;
