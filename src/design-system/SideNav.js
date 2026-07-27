import { useState, useCallback, useEffect } from "react";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import "./SideNav.css";

const SideNavItem = ({ item, selectedKey, onSelect, depth }) => {
  const hasChildren = !!(item.children && item.children.length);
  const [open, setOpen] = useState(true);

  const handleClick = useCallback(
    (e) => {
      if (item.disabled) return;
      if (hasChildren) {
        setOpen((v) => !v);
        return;
      }
      if (typeof item.onClick === "function") item.onClick(e);
      onSelect(item.key);
    },
    [hasChildren, item, onSelect]
  );

  const isSelected = String(selectedKey) === String(item.key);

  return (
    <div className="ds-sidenav-group">
      <button
        type="button"
        className={`ds-sidenav-item${isSelected ? " is-selected" : ""}${
          hasChildren ? " has-children" : ""
        }`}
        style={{ paddingInlineStart: 16 + depth * 20 }}
        onClick={handleClick}
        disabled={item.disabled}
        title={typeof item.label === "string" ? item.label : undefined}
      >
        {item.icon && <span className="ds-sidenav-icon">{item.icon}</span>}
        <span className="ds-sidenav-label">{item.label}</span>
        {hasChildren && (
          <ChevronRightIcon
            className={`ds-sidenav-caret${open ? " is-open" : ""}`}
            fontSize="small"
          />
        )}
      </button>
      {hasChildren && open && (
        <div className="ds-sidenav-children">
          {item.children.map((child) => (
            <SideNavItem
              key={child.key}
              item={child}
              selectedKey={selectedKey}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SideNav = ({
  items = [],
  defaultSelectedKey,
  selectedKey: controlledKey,
  onSelect,
  className = "",
  style,
}) => {
  const [internalKey, setInternalKey] = useState(defaultSelectedKey);

  useEffect(() => {
    if (defaultSelectedKey !== undefined) {
      setInternalKey(defaultSelectedKey);
    }
  }, [defaultSelectedKey]);

  const selectedKey = controlledKey !== undefined ? controlledKey : internalKey;

  const handleSelect = useCallback(
    (key) => {
      if (controlledKey === undefined) setInternalKey(key);
      if (typeof onSelect === "function") onSelect({ key });
    },
    [controlledKey, onSelect]
  );

  return (
    <nav className={`ds-sidenav ${className}`.trim()} style={style}>
      {items.map((item) => (
        <SideNavItem
          key={item.key}
          item={item}
          selectedKey={selectedKey}
          onSelect={handleSelect}
          depth={0}
        />
      ))}
    </nav>
  );
};

export default SideNav;
