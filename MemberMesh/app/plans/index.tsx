import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useTogglePlan,
  useDeletePlan,
} from "../../hooks/useMembership";
import PlanModal from "./components/PlanModal"; // We'll build this next

export default function PlansScreen() {
  const { data: plans, isLoading } = usePlans();
  const { mutate: createPlan } = useCreatePlan();
  const { mutate: updatePlan } = useUpdatePlan();
  const { mutate: togglePlan } = useTogglePlan();
  const { mutate: deletePlan } = useDeletePlan();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setModalVisible(true);
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setModalVisible(true);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.planName}>{item.name}</Text>
          <View style={styles.badgeContainer}>
             <View style={[styles.statusBadge, { backgroundColor: item.isActive ? "#E8F5E9" : "#FFEBEE" }]}>
                <Text style={[styles.statusText, { color: item.isActive ? "#2E7D32" : "#C62828" }]}>
                    {item.isActive ? "● Active" : "● Inactive"}
                </Text>
             </View>
          </View>
        </View>
        <Text style={styles.planPrice}>₹{item.price}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{item.duration} {item.billingCycle.toLowerCase()}(s)</Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
            <Text style={styles.editEmoji}>✏️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.iconBtn, { backgroundColor: item.isActive ? '#FFF4E5' : '#E3F2FD' }]} 
            onPress={() => togglePlan(item._id)}
          >
            <Text style={styles.editEmoji}>{item.isActive ? "⏸️" : "▶️"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FFEBEE' }]} onPress={() => deletePlan(item._id)}>
            <Text style={styles.editEmoji}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Membership</Text>
            <Text style={styles.subtitle}>Manage your subscription tiers</Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={handleCreateNew}>
          <Text style={styles.fabText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={plans}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No plans found. Create your first one!</Text>
            </View>
        }
      />

      <PlanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(data: any) => {
          if (editingPlan) {
            updatePlan({ id: editingPlan._id, data });
          } else {
            createPlan(data);
          }
        }}
        initialData={editingPlan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: "800", color: "#1E293B", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 2 },
  fab: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  planPrice: { fontSize: 20, fontWeight: "800", color: "#6366F1" },
  badgeContainer: { marginTop: 6, flexDirection: 'row' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: "700", textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 11, color: "#94A3B8", textTransform: 'uppercase', fontWeight: '600' },
  metaValue: { fontSize: 14, color: "#475569", fontWeight: '600', marginTop: 2 },
  actionGroup: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    backgroundColor: "#F1F5F9",
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editEmoji: { fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: "#94A3B8", fontSize: 16 }
});