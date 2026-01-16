export const MOCK_QUIZ = {
    id: "quiz-001",
    title: "Dasar Manajemen Pemasaran",
    questions: [
        {
            id: "q1",
            text: "Apa tujuan utama dari segmentasi pasar?",
            type: "MULTIPLE_CHOICE",
            options: [
                { id: "a", text: "Meningkatkan biaya produksi" },
                { id: "b", text: "Mengidentifikasi kelompok konsumen yang spesifik" },
                { id: "c", text: "Mengurangi kualitas produk" },
                { id: "d", text: "Menghindari persaingan" }
            ],
            correctAnswer: "b"
        },
        {
            id: "q2",
            text: "Manakah yang termasuk dalam bauran pemasaran (4P)?",
            type: "MULTIPLE_CHOICE",
            options: [
                { id: "a", text: "Planning, Process, People, Physical" },
                { id: "b", text: "Product, Price, Place, Promotion" },
                { id: "c", text: "Power, Position, Politics, Public" },
                { id: "d", text: "Profit, People, Planet, Peace" }
            ],
            correctAnswer: "b"
        }
    ]
};
