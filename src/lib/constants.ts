export const DEPARTMENTS = [
    { id: "akt", name: "Akuntansi", level: "S1" },
    { id: "ling", name: "Ilmu Lingkungan", level: "S1" },
    { id: "ikan", name: "Ilmu Perikanan", level: "S1" },
    { id: "mnj-s1", name: "Manajemen", level: "S1" },
    { id: "mnj-s2", name: "Manajemen", level: "S2" },
];

export const MOCK_LABS = [
    {
        id: "1",
        title: "Lab Manajemen Pemasaran",
        departmentId: "mnj-s1",
        departmentName: "Manajemen (S1)",
        description: "Simulasi strategi pemasaran digital dan branding.",
        imageIcon: "📊",
        moduleCount: 8,
        progress: 45,
        tag: "Active"
    },
    {
        id: "2",
        title: "Lab Manajemen SDM",
        departmentId: "mnj-s1",
        departmentName: "Manajemen (S1)",
        description: "Roleplay wawancara dan manajemen konflik.",
        imageIcon: "🤝",
        moduleCount: 5,
        progress: 0,
        tag: "New"
    },
    {
        id: "3",
        title: "Lab Analisis Kualitas Air",
        departmentId: "ikan",
        departmentName: "Ilmu Perikanan (S1)",
        description: "Pengujian sampel air dan identifikasi mikroorganisme.",
        imageIcon: "💧",
        moduleCount: 12,
        progress: 10,
        tag: "Prodi"
    },
    {
        id: "4",
        title: "Lab Audit Keuangan",
        departmentId: "akt",
        departmentName: "Akuntansi (S1)",
        description: "Simulasi audit laporan keuangan perusahaan dagang.",
        imageIcon: "📑",
        moduleCount: 6,
        progress: 0,
        tag: "Prodi"
    }
];
