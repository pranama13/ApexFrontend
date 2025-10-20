import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import styles from "@/components/_App/LeftSidebar/SubMenu.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import BASE_URL from "Base/api";

const SidebarLabel = styled("span")(({ theme }) => ({
  position: "relative",
  top: "-3px",
}));

const SubMenu = ({ item, allItems,onCheckPermission }) => {
  const [subnav, setSubnav] = useState(false);  
  const [cat, setCat] = useState(null);  
  const router = useRouter();
  const role = localStorage.getItem("role");

  const isActive = router.asPath === item.path || router.asPath.startsWith(item.path);

  const showSubnav = () => {
    setSubnav(!subnav);
  };


  const handleSubNavClick = (subItem) => {
    sessionStorage.setItem("moduleid", item.ModuleId);
    sessionStorage.setItem("category", subItem.categoryId);
    router.push(subItem.path);
  };

  const fetchPermission = async (cId) => {
    try {
      const response = await fetch(`${BASE_URL}/User/GetModuleCategoryNavigationPermissions?roleId=${role}&categoryId=${cId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const result = await response.json();
      if(onCheckPermission){
        onCheckPermission(result.result)
      }

    } catch (err) {
      //
    }
  };

  useEffect(() => {
    const normalize = (path) => path.replace(/\/+$/, "");
    const currentPath = normalize(router.asPath.split("?")[0].split("#")[0]);

    allItems.forEach((item) => {
      const matchedSub = item.subNav?.find(
        (subItem) =>
          normalize(subItem.path) === currentPath ||
          currentPath.startsWith(normalize(subItem.path))
      );
      if (matchedSub) {        
        sessionStorage.setItem("moduleid", item.ModuleId);
        sessionStorage.setItem("category", matchedSub.categoryId);
        setCat(matchedSub.categoryId);
      }
    });
  }, [router.asPath, allItems]);

  useEffect(() => {
      if (cat) {
        fetchPermission(cat);
      }
    }, [cat]);

  const availableSubNav = item.subNav?.filter((subItem) => subItem.isAvailable) || [];

  if ((item.title.toLowerCase() === "dashboard"||item.title.toLowerCase() === "contact") && availableSubNav.length === 1) {
    const onlySubItem = availableSubNav[0];
    item.path = onlySubItem.path;
    item.subNav = null;
  }

  const handleMainClick = (e) => {
    e.preventDefault();

    if (item.subNav) {
      showSubnav();
    } else {
      sessionStorage.setItem("moduleid", item.ModuleId);
      router.push(item.path);
    }
  };

  return (
    <>
      <Link
        href="#"
        onClick={handleMainClick}
        className={`${styles.sidebarLink} ${isActive ? "sidebarLinkActive" : ""}`}
      >
        <div>
          {item.icon}
          <SidebarLabel className="ml-1">{item.title}</SidebarLabel>
        </div>
        <div>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
              ? item.iconClosed
              : null}
        </div>
      </Link>

      {subnav &&
        availableSubNav.map((subItem, index) => (
          <div key={index} className={styles.subMenu}>
            <div
              onClick={(e) => {
                e.preventDefault();
                handleSubNavClick(subItem);
              }}
              className={styles.sidebarLink}
              style={{ cursor: "pointer" }}
            >
              <div>
                {subItem.icon}
                <SidebarLabel className="ml-1">{subItem.title} {subItem.categoryId === 60 ? "(POS)" : ""}</SidebarLabel>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default SubMenu;
