import React, { useState } from "react";
import {
  View, FlatList, ActivityIndicator, Text,
  StatusBar, Alert, StyleSheet,
} from "react-native";

import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from "../../hooks/useMember";
import { Member } from "../../types/member";
import { C } from "./components/theme";

import { MembersHeader }                        from "./components/MembersHeader";
import { CountPill }                            from "./components/CountPill"
import { MemberCard }                           from "./components//MemberCard"
import { EmptyState }                           from "./components/EmptyState"
import { MemberFormModal, MemberFormValues }    from "./components/MemberFormModal"

const EMPTY_FORM: MemberFormValues = { name: "", phone: "", email: "", address: "" };

export default function MembersScreen() {
  const { data: members, isLoading } = useMembers();
  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();

  const [modalVisible, setModalVisible]   = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm]                   = useState<MemberFormValues>(EMPTY_FORM);

  const openAdd = () => {
    setEditingMember(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setForm({ name: member.name, phone: member.phone, email: member.email || "", address: member.address || "" });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert("Missing Info", "Name is required."); return; }
    const payload: any = { name: form.name };
    if (form.phone)   payload.phone   = form.phone;
    if (form.email)   payload.email   = form.email;
    if (form.address) payload.address = form.address;
    editingMember
      ? updateMutation.mutate({ id: editingMember._id, data: payload })
      : createMutation.mutate(payload);
    setModalVisible(false);
  };

  const handleDelete = (id: string) =>
    Alert.alert("Remove Member", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", onPress: () => deleteMutation.mutate(id), style: "destructive" },
    ]);

  if (isLoading) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading members…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />

      <MembersHeader onAdd={openAdd} />

      {!!members?.length && <CountPill count={members.length} />}

      <View style={styles.listWrapper}>
        {!members?.length ? (
          <EmptyState />
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item: Member) => item._id}
            renderItem={({ item, index }) => (
              <MemberCard item={item} index={index} onEdit={openEdit} onDelete={handleDelete} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <MemberFormModal
        visible={modalVisible}
        editingMember={editingMember}
        form={form}
        onChangeForm={setForm}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: C.primaryDark },
  listWrapper: { flex: 1, backgroundColor: C.cream },
  listContent: { padding: 20, paddingBottom: 40 },
  center:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: C.inkLight, fontWeight: "500" },
});