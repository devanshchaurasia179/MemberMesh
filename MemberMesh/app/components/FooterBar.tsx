import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  route: string;
}[] = [
  { id: "home",         label: "Home",    icon: "home",    route: "/"             },
  { id: "plans",        label: "Plans",   icon: "layers",  route: "/plans"        },
  { id: "subscription", label: "Members", icon: "users",   route: "/subscription" },
  { id: "profile",      label: "Profile", icon: "user",    route: "/profile"      },
];

// ─── Single tab ───────────────────────────────────────────────────────────────
function NavTab({
  item,
  isActive,
  onPress,
}: {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.tabInner}>
        <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
          <Feather
            name={item.icon}
            size={16}
            color={isActive ? "#FFFFFF" : "rgba(219,234,254,0.5)"}
          />
        </View>
        <Text
          style={[
            styles.label,
            { color: isActive ? "#DBEAFE" : "rgba(219,234,254,0.45)" },
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {isActive && <View style={styles.activeDot} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Footer bar ───────────────────────────────────────────────────────────────
export default function FooterBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const insets   = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.route === "/"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname.startsWith(item.route);

          return (
            <NavTab
              key={item.id}
              item={item}
              isActive={isActive}
              onPress={() => router.push(item.route as any)}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 6,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e3a8a",
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 5,
    width: "90%",
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 3,
    minWidth: 48,
  },
  iconWrap: {
    width: 34,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  label: {
    fontFamily: "Jost-Bold",
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  activeDot: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FBBF24",
    marginTop: 1,
  },
});
