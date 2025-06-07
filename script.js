const url = "https://script.google.com/macros/s/AKfycbxAm9SvhJn5SEPYxGSysEuarr-liSh8EbiR79DR86LWWtVCh0pa7B7BMQlbCaY8WChUNA/exec";

let data = [];
let currentIndex = 0;
let correctCount = 0;
let totalCount = 0;
let isfalse = 0;

const scoreDiv = document.getElementById("score");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

function updateScore() {
    scoreDiv.textContent = `Đúng: ${correctCount} / ${totalCount}`;
}

async function fetchData() {
    const res = await fetch(url);
    data = await res.json();
    shuffle(data);
    currentIndex = 0;
    correctCount = 0;
    totalCount = 0;
    updateScore();
    nextQuestion();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function nextQuestion() {
    if (currentIndex >= data.length && currentIndex > 0) {
        alert("🎉 Bạn đã hoàn thành bài quiz!");
        currentIndex = 0;
        shuffle(data);
    }

    const item = data[currentIndex];
    currentIndex++;
    
    updateScore();

    const questionType = Math.random() < 0.5 ? 0 : 1;

    let correctAnswer = "";
    let questionText = "";
    let allAnswers = [];

    if (questionType === 0) {
        // Từ ví dụ => chọn đúng nghĩa
        questionText = item.example;
        correctAnswer = item.meaning;
        const others = data.filter(d => d.meaning !== item.meaning);
        shuffle(others);
        allAnswers = [correctAnswer, ...others.slice(0, 3).map(d => d.meaning)];
    } else {
        // Từ nghĩa => chọn đúng phrasal verb
        questionText = item.meaning;
        correctAnswer = item.verb;
        const others = data.filter(d => d.verb !== item.verb);
        shuffle(others);
        allAnswers = [correctAnswer, ...others.slice(0, 3).map(d => d.verb)];
    }

    shuffle(allAnswers);

    document.getElementById("question").textContent = questionText;
    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    const speakBtn = document.getElementById("speakBtn");
    speakBtn.style.display = questionType === 0 ? "inline-block" : "none";
    speakBtn.onclick = () => {
        const utterance = new SpeechSynthesisUtterance(item.verb);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    };
    allAnswers.forEach(ans => {
        const div = document.createElement("div");
        div.textContent = ans;
        div.className = "answer";
        div.onclick = () => {
            if (div.classList.contains("wrong") || div.classList.contains("correct")) {
                // Đã chọn rồi, không làm gì nữa
                return;
            }
            
            if (ans === correctAnswer) {
                // Khi chọn đúng thì khóa hết các đáp án
                Array.from(answersDiv.children).forEach(child => child.style.pointerEvents = 'none');
                div.classList.add("correct");
                totalCount++;
                if(isfalse == 0) correctCount++;
                else isfalse = 0;
                updateScore();
                correctSound.currentTime = 0;
                correctSound.play().catch(() => {});
                document.getElementById("nextBtn").style.display = "inline-block"; // hiện nút
                speakBtn.style.display = "inline-block";

            } 
            else {
                div.classList.add("wrong");
                div.style.pointerEvents = "none";
                wrongSound.currentTime = 0;
                wrongSound.play().catch(() => {});
                isfalse = 1;
            }
        };
        answersDiv.appendChild(div);
    });
}

document.getElementById("preBtn").onclick = () => {
    if (currentIndex >= 2) {
        currentIndex -= 2;
        nextQuestion();
    } else alert("Đây là câu hỏi đầu tiên.");
    
};

document.getElementById("nextBtn").onclick = () => {
    document.getElementById("nextBtn").style.display = "none"; // ẩn nút đi
    nextQuestion();  // chuyển câu hỏi tiếp theo
};

document.getElementById('resetBtn').onclick = () => {
    shuffle(data);
    currentIndex = 0;
    correctCount = 0;
    totalCount = 0;
    nextQuestion();
    updateScore();
};


fetchData();
