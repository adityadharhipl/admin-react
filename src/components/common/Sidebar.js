import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import menu from '../Data/Menu/menu.json';
import { Toaster } from 'react-hot-toast';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarMini, setIsSidebarMini] = useState(false);
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeKey, setActiveKey] = useState(location.pathname);

    useEffect(() => {
        setActiveKey(location.pathname);
    }, [location]);

    // Open parent menu if any child is active (runs after menuData is loaded)
    useEffect(() => {
        if (menuData.length === 0) return;

        menuData.forEach((d, i) => {
            if (d.children && d.children.length > 0) {
                const hasActiveChild = d.children.some(child =>
                    (process.env.PUBLIC_URL + "/" + child.routerLink[0]) === location.pathname
                );
                if (hasActiveChild) {
                    setTimeout(() => {
                        openChildren1(`menu-Pages${i}`);
                    }, 100);
                }
            }
        });
    }, [location.pathname, menuData]);

    useEffect(() => {
        // Removed privilege check, always show all menu
        setMenuData([...menu.menu]);
        setLoading(false);
    }, []);

    const openChildren = (id) => {
        const menutab = document.getElementById(id);
        if (!menutab) return;

        const isCurrentlyOpen = menutab.classList.contains("show");

        // Close all other parent menus first
        const otherTabs = document.getElementsByClassName("has-children");
        if (otherTabs) {
            for (let i = 0; i < otherTabs.length; i++) {
                if (otherTabs[i].id !== id) {
                    otherTabs[i].className = otherTabs[i].className.replace(" show", "");
                    if (otherTabs[i].parentElement.children.length > 1) {
                        otherTabs[i].parentElement.children[0].setAttribute("aria-expanded", "false");
                    }
                }
            }
        }

        // Toggle: if open, close it; if closed, open it
        if (isCurrentlyOpen) {
            menutab.classList.remove("show");
            if (menutab.parentElement.children.length > 1) {
                menutab.parentElement.children[0].setAttribute("aria-expanded", "false");
            }
        } else {
            menutab.classList.add("show");
            if (menutab.parentElement.children.length > 1) {
                menutab.parentElement.children[0].setAttribute("aria-expanded", "true");
            }
        }
    };

    const openChildren1 = (id) => {
        const otherTabs = document.getElementsByClassName("has-children");
        if (otherTabs) {
            for (let i = 0; i < otherTabs.length; i++) {
                if (otherTabs[i].className.includes(id)) continue;
                otherTabs[i].className = otherTabs[i].className.replace(" show", "");
            }
        }
        const menutab = document.getElementById(id);
        if (menutab) {
            menutab.classList.add("show");
            if (menutab.parentElement.children.length > 1) {
                menutab.parentElement.children[0].setAttribute("aria-expanded", "true");
            }
        }
    };

    const isAnyChildActive = (item) => {
        if (!item.children) return false;
        return item.children.some(child => (process.env.PUBLIC_URL + "/" + child.routerLink[0]) === activeKey);
    };

    const handleClick = (route) => {
        setActiveKey(route);
        navigate(route);
        if (window.innerWidth < 992) {
            const sidebar = document.getElementById('mainsidemenu');
            if (sidebar) sidebar.classList.remove('open');
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) overlay.classList.remove('active');
        }
    };

    if (loading) {
        return (
            <div
                className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
                style={{ background: "linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)", zIndex: 9999 }}
            >
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: "4rem", height: "4rem", borderWidth: "6px" }}></div>
                <h5 className="fw-semibold text-primary">Loading your dashboard...</h5>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-center" reverseOrder={true} duration={10000} />
            <div id="mainsidemenu" className={`sidebar px-2 py-2 py-md-2 me-0 ${isSidebarMini ? "sidebar-mini" : ""}`} style={{ overflow: 'auto' }}>
                <div className="d-flex flex-column h-100">
                    <ul className="menu-list flex-grow-1 mt-1" style={{ overflow: 'unset' }}>
                        {menuData?.map((d, i) => {
                            if (d.children?.length === 0) {
                                return (
                                    <li key={`menu-item-${i}`} className="collapsed">
                                        <Link
                                            to={process.env.PUBLIC_URL + "/" + d.routerLink[0]}
                                            className={`m-link ${activeKey === (process.env.PUBLIC_URL + "/" + d.routerLink[0]) ? "active" : ""}`}
                                            onClick={() => handleClick(process.env.PUBLIC_URL + "/" + d.routerLink[0])}
                                        >
                                            <i className={d.iconClass}></i>
                                            <span>{d.name}</span>
                                        </Link>
                                    </li>
                                );
                            }
                            return (
                                <li key={`menu-item-${i}`} className="collapsed">
                                    <a
                                        className={`m-link ${isAnyChildActive(d) ? "active" : ""}`}
                                        href="#!"
                                        onClick={() => openChildren(`menu-Pages${i}`)}
                                    >
                                        <i className={d.iconClass || "icofont-file-alt fs-5"}></i>
                                        <span>{d.name}</span>
                                        <span className="arrow icofont-rounded-down ms-auto"></span>
                                    </a>
                                    {d.children.length > 0 &&
                                        <ul className="sub-menu collapse has-children" id={`menu-Pages${i}`}>
                                            {d.children.map((data, ind) => {
                                                return (
                                                    <li key={`submenu-item-${ind}`}>
                                                        <Link
                                                            className={`${(process.env.PUBLIC_URL + "/" + data.routerLink[0]) === activeKey ? "ms-link active" : "ms-link"}`}
                                                            to={process.env.PUBLIC_URL + "/" + data.routerLink[0]}
                                                            onClick={() => handleClick(process.env.PUBLIC_URL + "/" + data.routerLink[0])}
                                                        >
                                                            <i className={data?.iconClass || "icofont-file-alt fs-5"}></i>
                                                            <span>{data?.name}</span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    }
                                </li>
                            );
                        })}
                    </ul>
                    <button type="button" className="btn btn-link sidebar-mini-btn align-self-center" onClick={() => setIsSidebarMini(!isSidebarMini)}>
                        <span className="ms-0"><i className="icofont-bubble-right"></i></span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;