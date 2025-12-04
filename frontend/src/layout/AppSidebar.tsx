import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import { GridIcon, PieChartIcon, UserCircleIcon, ListIcon, TableIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import Logo from "../components/common/Logo";

const navItems = [
    {
        name: "Dashboard",
        path: "/Home",
        icon: <GridIcon />,
    },
    {
        name: "CV Analysis",
        path: "/CvAnalysis",
        icon: <PieChartIcon />,
    },
    {
        name: "Comparaison",
        path: "/comparaison",
        icon: <TableIcon />,
    },
    {
        name: "CV Extraction & Reformulation",
        path: "/CvExtractionPage",
        icon: <ListIcon />,
    },
    {
        name: "CV Builder",
        path: "/resume-builder",
        icon: <UserCircleIcon />,
    },
    {
        name: "Recommendations",
        path: "/Recommendation",
        icon: <PieChartIcon />,
    },
];

const AppSidebar = () => {
    const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
    const location = useLocation();

    const isActive = useCallback(
        (path: string) => location.pathname === path,
        [location.pathname]
    );

    const sidebarOpen = isExpanded || isHovered || isMobileOpen;

    return (
        <aside
            className={`
                fixed top-0 left-0 h-screen
                bg-white dark:bg-gray-900
                border-r border-gray-200 dark:border-gray-800
                z-50 transition-all duration-300 ease-in-out
                px-5 flex flex-col
                ${sidebarOpen ? "w-[260px]" : "w-[80px]"}
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Logo Section */}
            <div className="py-8 flex justify-center">
                <Link to="/home">
                    {sidebarOpen ? (
                        <Logo
                            size={45}
                            showSubtitle={false}
                        />
                    ) : (
                        <img
                            src="/images/logo/logo.png"
                            width={38}
                            height={38}
                            alt="CVInsight Icon"
                            className="transition-all duration-300"
                        />
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-6 flex flex-col gap-3">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`
                            flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200
                            group
                            ${isActive(item.path)
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
                            ${!sidebarOpen ? "justify-center" : "justify-start"}
                        `}
                    >
                        {/* Icon */}
                        <span
                            className={`
                                ${isActive(item.path)
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400"}
                                transition-colors duration-200
                                flex
                            `}
                        >
                            {item.icon}
                        </span>

                        {/* Text only when expanded */}
                        {sidebarOpen && (
                            <span className="font-medium text-sm">
                                {item.name}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Spacer to bottom */}
            <div className="flex-grow"></div>
        </aside>
    );
};

export default AppSidebar;
