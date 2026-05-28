import React, { useState } from "react";
import {
  View, Text, Modal, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const C = {
  purple: "#7B6EF6", purpleLight: "#EEEEFE", purpleMid: "#A89AF8", purpleDark: "#5B4FD4",
  white: "#FFFFFF", offWhite: "#F7F7FD", border: "#E8E6FC",
  text: "#1A1A2E", textMid: "#6B6B8A", textLight: "#AEAECB",
  green: "#10D4A0", greenLight: "#E6FAF6",
  red: "#FF5E7D", redLight: "#FFECF0",
  amber: "#FFB740", amberLight: "#FFF5E0",
};

type Member = { _id: string; name: string; phone?: string };
type Plan   = { _id: string; name: string; price: number; duration: number; billingCycle: string };

type Props = {
  visible:   boolean;
  onClose:   () => void;
  members:   Member[];
  plans:     Plan[];
  onSubmit:  (data: any) => void;
  isLoading?: boolean;
};

const BILLING_CYCLES = [
  { key: "MONTH", label: "Monthly" },
  { key: "YEAR",  label: "Yearly"  },
  { key: "DAYS",  label: "Days"    },
];

const safeStr   = (v: any): string  => (typeof v === "string" ? v : "");
const safeLower = (v: any): string  => safeStr(v).toLowerCase();
const getInitials = (name: any): string =>
  safeStr(name).split(" ").map((w) => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "?";

const SubscriptionModal: React.FC<Props> = ({ visible, onClose, members, plans, onSubmit, isLoading }) => {
  const [memberQuery,    setMemberQuery]    = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [createMember,   setCreateMember]   = useState(false);
  const [memberName,     setMemberName]     = useState("");
  const [phone,          setPhone]          = useState("");

  const [planQuery,    setPlanQuery]    = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [createPlan,   setCreatePlan]   = useState(false);
  const [planName,     setPlanName]     = useState("");
  const [price,        setPrice]        = useState("");
  const [duration,     setDuration]     = useState("");
  const [billingCycle, setBillingCycle] = useState("MONTH");

  const [error, setError] = useState("");

  const filteredMembers = (members ?? []).filter(
    (m) => m && safeLower(m.name).includes(safeLower(memberQuery))
  );
  const filteredPlans = (plans ?? []).filter(
    (p) => p && safeLower(p.name).includes(safeLower(planQuery))
  );

  const resetMember = () => {
    setMemberQuery(""); setSelectedMember(null);
    setCreateMember(false); setMemberName(""); setPhone("");
  };
  const resetPlan = () => {
    setPlanQuery(""); setSelectedPlan(null);
    setCreatePlan(false); setPlanName(""); setPrice(""); setDuration(""); setBillingCycle("MONTH");
  };
  const handleClose = () => { resetMember(); resetPlan(); setError(""); onClose(); };

  const validate = (): string | null => {
    const hasMember = selectedMember || (createMember && (memberName || memberQuery).trim());
    const hasPlan   = selectedPlan   || (createPlan && planName.trim() && price && duration);
    if (!hasMember) return "Please select or create a member.";
    if (!hasPlan)   return "Please select or create a plan with name, price, and duration.";
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");

    const payload: any = {};
    if (selectedMember) {
      payload.memberId = selectedMember._id;
    } else if (createMember) {
      payload.memberName = memberName.trim() || memberQuery.trim();
      if (phone.trim()) payload.phone = phone.trim();
    }
    if (selectedPlan) {
      payload.planId = selectedPlan._id;
    } else if (createPlan) {
      payload.planData = {
        name:         planName.trim() || planQuery.trim(),
        price:        Number(price)   || 0,
        duration:     Number(duration) || 0,
        billingCycle: billingCycle,
      };
    }
    onSubmit(payload);
  };

  const showMemberChip   = !!selectedMember;
  const showMemberForm   = !selectedMember && createMember;
  const showMemberSearch = !selectedMember && !createMember;
  const showPlanChip   = !!selectedPlan;
  const showPlanForm   = !selectedPlan && createPlan;
  const showPlanSearch = !selectedPlan && !createPlan;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBg}>
                <MaterialCommunityIcons name="card-account-details-star-outline" size={20} color={C.white} />
              </View>
              <View>
                <Text style={styles.headerLabel}>NEW</Text>
                <Text style={styles.headerTitle}>Subscription</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7} disabled={isLoading}>
              <Feather name="x" size={16} color={C.textMid} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 16 }}>

            {/* Error */}
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={14} color={C.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* MEMBER SECTION */}
            <SectionWrapper label="MEMBER" dotColor={C.purple}>
              {showMemberChip && (
                <SelectedChip
                  initials={getInitials(selectedMember!.name)}
                  name={selectedMember!.name}
                  sub={selectedMember!.phone}
                  subIcon="call-outline"
                  accentColor={C.purple}
                  bgColor={C.purpleLight}
                  onReset={resetMember}
                />
              )}
              {showMemberSearch && (
                <SearchDropdown
                  query={memberQuery}
                  onQuery={(t) => { setMemberQuery(safeStr(t)); setSelectedMember(null); setCreateMember(false); setMemberName(""); setPhone(""); }}
                  onClear={resetMember}
                  placeholder="Search member by name…"
                  items={filteredMembers}
                  renderItem={(item) => (
                    <TouchableOpacity onPress={() => { setSelectedMember(item); setMemberQuery(item.name); setCreateMember(false); }} style={styles.dropRow} activeOpacity={0.7}>
                      <View style={[styles.dropAvatar, { backgroundColor: C.purpleLight }]}>
                        <Text style={[styles.dropAvatarText, { color: C.purple }]}>{getInitials(item.name)}</Text>
                      </View>
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.dropName}>{safeStr(item.name)}</Text>
                        {item.phone ? <Text style={styles.dropSub}>{item.phone}</Text> : null}
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={C.textLight} />
                    </TouchableOpacity>
                  )}
                  addNewLabel={`Add "${memberQuery}" as new member`}
                  addNewColor={C.purple}
                  addNewIcon="person-add-outline"
                  onAddNew={() => { setCreateMember(true); setMemberName(memberQuery); }}
                />
              )}
              {showMemberForm && (
                <NewForm title="New member" accentColor={C.purple} bgColor={C.purpleLight} onDiscard={resetMember}>
                  <FieldLabel label="Full name *" />
                  <FieldBox icon="person-outline" iconColor={C.purple}>
                    <TextInput placeholder="e.g. Arjun Mehta" placeholderTextColor={C.textLight} value={memberName} onChangeText={(t) => setMemberName(safeStr(t))} style={styles.fieldInput} />
                  </FieldBox>
                  <FieldLabel label="Phone number (optional)" />
                  <View style={[styles.fieldBox, { paddingHorizontal: 0 }]}>
                    <View style={styles.dialCodeBlock}><Text style={styles.dialCodeText}>🇮🇳  +91</Text></View>
                    <TextInput placeholder="98765 43210" placeholderTextColor={C.textLight} value={phone} onChangeText={(t) => setPhone(safeStr(t))} keyboardType="phone-pad" style={[styles.fieldInput, { flex: 1, paddingHorizontal: 12 }]} maxLength={10} />
                  </View>
                </NewForm>
              )}
            </SectionWrapper>

            {/* PLAN SECTION */}
            <SectionWrapper label="PLAN" dotColor={C.amber}>
              {showPlanChip && (
                <SelectedChip
                  initials={undefined}
                  starIcon
                  name={selectedPlan!.name}
                  sub={`₹${selectedPlan!.price} · ${selectedPlan!.duration} ${selectedPlan!.billingCycle}`}
                  accentColor={C.amber}
                  bgColor={C.amberLight}
                  onReset={resetPlan}
                />
              )}
              {showPlanSearch && (
                <SearchDropdown
                  query={planQuery}
                  onQuery={(t) => { setPlanQuery(safeStr(t)); setSelectedPlan(null); setCreatePlan(false); }}
                  onClear={resetPlan}
                  placeholder="Search plan by name…"
                  items={filteredPlans}
                  renderItem={(item) => (
                    <TouchableOpacity onPress={() => { setSelectedPlan(item); setPlanQuery(item.name); setCreatePlan(false); }} style={styles.dropRow} activeOpacity={0.7}>
                      <View style={[styles.dropAvatar, { backgroundColor: C.amberLight }]}>
                        <Ionicons name="star" size={14} color={C.amber} />
                      </View>
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.dropName}>{safeStr(item.name)}</Text>
                        <Text style={styles.dropSub}>{item.duration} {safeStr(item.billingCycle)}</Text>
                      </View>
                      <View style={styles.pricePill}>
                        <MaterialCommunityIcons name="currency-inr" size={10} color={C.amber} />
                        <Text style={styles.pricePillText}>{item.price}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  addNewLabel={`Add "${planQuery}" as new plan`}
                  addNewColor={C.amber}
                  addNewIcon="add-circle-outline"
                  onAddNew={() => { setCreatePlan(true); setPlanName(planQuery); }}
                />
              )}
              {showPlanForm && (
                <NewForm title="New plan" accentColor={C.amber} bgColor={C.amberLight} onDiscard={resetPlan}>
                  <FieldLabel label="Plan name *" />
                  <FieldBox icon="bookmark-outline" iconColor={C.amber}>
                    <TextInput placeholder="e.g. Premium Monthly" placeholderTextColor={C.textLight} value={planName} onChangeText={(t) => setPlanName(safeStr(t))} style={styles.fieldInput} />
                  </FieldBox>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <FieldLabel label="Price (₹) *" />
                      <FieldBox icon="cash-outline" iconColor={C.amber}>
                        <TextInput placeholder="999" placeholderTextColor={C.textLight} value={price} onChangeText={(t) => setPrice(safeStr(t))} keyboardType="numeric" style={styles.fieldInput} />
                      </FieldBox>
                    </View>
                    <View style={{ flex: 1 }}>
                      <FieldLabel label="Duration *" />
                      <FieldBox icon="time-outline" iconColor={C.amber}>
                        <TextInput placeholder="1" placeholderTextColor={C.textLight} value={duration} onChangeText={(t) => setDuration(safeStr(t))} keyboardType="numeric" style={styles.fieldInput} />
                      </FieldBox>
                    </View>
                  </View>
                  <FieldLabel label="Billing cycle" />
                  <View style={styles.cycleRow}>
                    {BILLING_CYCLES.map((cycle) => {
                      const active = billingCycle === cycle.key;
                      return (
                        <TouchableOpacity key={cycle.key} onPress={() => setBillingCycle(cycle.key)}
                          style={[styles.cycleBtn, active && { backgroundColor: C.amber, borderColor: C.amber }]}
                          activeOpacity={0.8}>
                          <Text style={[styles.cycleBtnText, active && { color: C.white }]}>{cycle.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </NewForm>
              )}
            </SectionWrapper>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleClose} style={styles.footerCancel} activeOpacity={0.7} disabled={isLoading}>
              <Text style={styles.footerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[styles.footerSubmit, isLoading && { opacity: 0.7 }]} activeOpacity={0.85} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator size="small" color={C.white} />
                : <Ionicons name="checkmark-circle-outline" size={18} color={C.white} />
              }
              <Text style={styles.footerSubmitText}>{isLoading ? "Creating…" : "Create Subscription"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* Sub-components */
function SectionWrapper({ label, dotColor, children }: { label: string; dotColor: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabelRow}>
        <View style={[styles.sectionDot, { backgroundColor: dotColor }]} />
        <Text style={styles.sectionLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function SelectedChip({ initials, starIcon, name, sub, subIcon, accentColor, bgColor, onReset }: any) {
  return (
    <View style={[styles.selectedCard, { borderColor: accentColor + "60" }]}>
      <View style={[styles.avatar, { backgroundColor: bgColor }]}>
        {starIcon
          ? <Ionicons name="star" size={18} color={accentColor} />
          : <Text style={[styles.avatarText, { color: accentColor }]}>{initials}</Text>
        }
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.selectedName}>{safeStr(name)}</Text>
        {sub ? (
          <View style={styles.infoRow}>
            {subIcon ? <Ionicons name={subIcon} size={11} color={accentColor} /> : null}
            <Text style={[styles.selectedSub, { color: accentColor }]}>{sub}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity onPress={onReset} style={[styles.changeBtn, { borderColor: accentColor + "60" }]} activeOpacity={0.7}>
        <Feather name="edit-2" size={12} color={accentColor} />
        <Text style={[styles.changeBtnText, { color: accentColor }]}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}

function SearchDropdown({ query, onQuery, onClear, placeholder, items, renderItem, addNewLabel, addNewColor, addNewIcon, onAddNew }: any) {
  return (
    <>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={15} color={C.textLight} />
        <TextInput placeholder={placeholder} placeholderTextColor={C.textLight} value={query} onChangeText={onQuery} style={styles.searchInput} />
        {query.length > 0 && <TouchableOpacity onPress={onClear}><Ionicons name="close-circle" size={15} color={C.textLight} /></TouchableOpacity>}
      </View>
      {query.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => renderItem(item)}
            ListEmptyComponent={<View style={styles.noResults}><Text style={styles.noResultsText}>No results found</Text></View>}
            ListFooterComponent={
              <TouchableOpacity onPress={onAddNew} style={styles.addNewRow} activeOpacity={0.7}>
                <View style={[styles.addNewCircle, { backgroundColor: addNewColor }]}>
                  <Ionicons name={addNewIcon} size={13} color={C.white} />
                </View>
                <Text style={[styles.addNewText, { color: addNewColor }]}>{addNewLabel}</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
    </>
  );
}

function NewForm({ title, accentColor, bgColor, onDiscard, children }: any) {
  return (
    <View style={[styles.newBox, { borderColor: accentColor + "60" }]}>
      <View style={styles.newBoxHeader}>
        <View style={[styles.newBadge, { backgroundColor: bgColor }]}>
          <Text style={[styles.newBadgeText, { color: accentColor }]}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onDiscard} activeOpacity={0.7}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function FieldBox({ icon, iconColor, children }: { icon: string; iconColor: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldBox}>
      <Ionicons name={icon as any} size={14} color={iconColor} style={{ marginRight: 8 }} />
      {children}
    </View>
  );
}

export default SubscriptionModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(12,8,40,0.65)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: C.offWhite, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 38 : 24, maxHeight: "93%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderColor: C.border },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconBg: { width: 44, height: 44, borderRadius: 13, backgroundColor: C.purple, alignItems: "center", justifyContent: "center" },
  headerLabel: { fontSize: 9, fontWeight: "800", color: C.purple, letterSpacing: 2, marginBottom: 1 },
  headerTitle: { fontSize: 19, fontWeight: "800", color: C.text, letterSpacing: -0.4 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.purpleLight, alignItems: "center", justifyContent: "center" },

  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.redLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: C.red + "40" },
  errorText: { fontSize: 12, color: C.red, fontWeight: "600", flex: 1 },

  section: { backgroundColor: C.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionDot: { width: 7, height: 7, borderRadius: 3.5 },
  sectionLabel: { fontSize: 10, fontWeight: "800", color: C.textLight, letterSpacing: 1.5 },

  selectedCard: { flexDirection: "row", alignItems: "center", backgroundColor: C.offWhite, borderRadius: 14, padding: 12, borderWidth: 1.5 },
  avatar: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontWeight: "800" },
  selectedName: { fontSize: 15, fontWeight: "700", color: C.text, letterSpacing: -0.3 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  selectedSub: { fontSize: 12 },
  changeBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  changeBtnText: { fontSize: 11, fontWeight: "700" },

  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: C.offWhite, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  dropdown: { marginTop: 6, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  dropRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderColor: C.offWhite },
  dropAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  dropAvatarText: { fontSize: 12, fontWeight: "800" },
  dropName: { fontSize: 14, fontWeight: "600", color: C.text },
  dropSub: { fontSize: 11, color: C.textLight, marginTop: 1 },
  pricePill: { flexDirection: "row", alignItems: "center", backgroundColor: C.amberLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 2 },
  pricePillText: { fontSize: 12, fontWeight: "700", color: C.amber },
  noResults: { paddingHorizontal: 14, paddingVertical: 12 },
  noResultsText: { fontSize: 13, color: C.textLight },
  addNewRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: C.offWhite },
  addNewCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  addNewText: { fontSize: 13, fontWeight: "700" },

  newBox: { borderRadius: 14, padding: 14, borderWidth: 1.5, backgroundColor: "#FAFAFF" },
  newBoxHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  newBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  newBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.2 },
  discardText: { fontSize: 12, color: C.red, fontWeight: "600" },

  fieldLabel: { fontSize: 10, fontWeight: "800", color: C.textLight, letterSpacing: 1, textTransform: "uppercase", marginTop: 12, marginBottom: 6 },
  fieldBox: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: C.white },
  fieldInput: { flex: 1, fontSize: 14, color: C.text },
  dialCodeBlock: { paddingHorizontal: 12, paddingVertical: 11, borderRightWidth: 1, borderColor: C.border, backgroundColor: C.purpleLight, justifyContent: "center" },
  dialCodeText: { fontSize: 13, fontWeight: "700", color: C.purple },

  cycleRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  cycleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, alignItems: "center", backgroundColor: C.white },
  cycleBtnText: { fontSize: 12, color: C.textMid, fontWeight: "700" },

  footer: { flexDirection: "row", gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: C.border },
  footerCancel: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.purpleLight, alignItems: "center" },
  footerCancelText: { fontSize: 14, color: C.purple, fontWeight: "700" },
  footerSubmit: { flex: 2.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: C.purple },
  footerSubmitText: { color: C.white, fontSize: 14, fontWeight: "800", letterSpacing: 0.2 },
});