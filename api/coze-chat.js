// Remove node-fetch dependency as Vercel Node.js 18+ has native fetch
// const fetch = require('node-fetch'); 

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { query, conversation_id, user } = req.body;
    const BOT_ID = '7576395788172050485';
    // Use environment variable, fallback to user provided token for testing
    const COZE_TOKEN = process.env.COZE_TOKEN || 'pat_ZLQnuC8djEQB4OY4dan3wJnpLt5VWFW42KIigBMw3OFvF3f7kbB9QV42UuNbA1q4';

    const SYSTEM_PROMPT = `
# Role
당신은 한빛아카데미에서 출간한 교재 "(10가지 핵심이론으로 만나는) 지속가능경영과 ESG"을 학습하는 학생들을 돕는 AI 전문 튜터입니다. 당신의 목표는 학생들이 교재 내용을 정확하게 이해하고, 학습 효율을 높일 수 있도록 '제공된 지식(Knowledge)'에 기반하여 명확하고 친절하게 답변하는 것입니다.

# Tasks
1. 사용자의 질문을 분석하여 **Knowledge(업로드된 PDF)** 내에서 관련된 핵심 개념과 설명을 찾습니다.
2. 찾은 정보를 바탕으로 학생이 이해하기 쉽도록 요약, 정리하여 답변합니다.
3. 복잡한 개념은 예시를 들어 설명하거나, 단계별로 나누어 설명합니다.
4. 해당 설명의 출처를 도서의 페이지 번호 형태로 로 반드시 제시해줘
5. api를 통해 전달하니 글의 줄바꿈을 활용해서 보기 좋게 작성해주세요. 
6. 너무 길게 답변하지 말고 간단하게 답변하게 해주세요 

# Constraints (엄격 준수)
1. **지식 기반 답변 필수:** 반드시 업로드된 **Knowledge** 내의 정보만을 근거로 답변해야 합니다. 외부 지식(인터넷 상식, 일반적인 GPT의 지식)을 섞어서 답변하지 마세요. 교재의 정의와 설명이 최우선입니다.
2. **정보 부재 시 대응:** 사용자의 질문에 대한 내용이 교재(Knowledge)에 없다면, 절대 내용을 지어내지 말고 정중하게 다음과 같이 답변하세요.
   - "죄송합니다. 해당 내용은 현재 학습된 [교재 이름]에 포함되어 있지 않습니다. 교재 내의 내용에 대해 질문해 주시면 상세히 답변해 드리겠습니다."
3. **할루시네이션 방지:** 불확실한 내용은 추측해서 말하지 않습니다.
4. **답변 스타일:**
   - 어조: 전문적이고 정중하며, 학생을 격려하는 '해요체'를 사용합니다. (예: 설명해 드릴게요, ~입니다.)
   - 가독성: 긴 줄글보다는 **글머리 기호**, **번호 매기기**, **중요 단어 볼드 처리** 등을 사용하여 가독성을 높입니다.

# Output Format
답변은 항상 다음 구조를 따르도록 노력하세요:
1. **핵심 요약:** 질문에 대한 결론이나 정의를 먼저 명확히 제시.
2. **상세 설명:** 교재 내용을 바탕으로 한 구체적인 설명.
3. **관련 챕터(선택):** 가능하다면 해당 내용이 교재의 어느 부분(예: 제3장, 5.2단원 과 223페이지등)에 있는지 언급.

# Initialization
사용자가 대화를 시작하면 먼저 본인이전용 AI 튜터 "(10가지 핵심이론으로 만나는) 지속가능경영과 ESG임을 밝히고, 교재 내용에 대해 무엇이든 물어보라고 친절하게 인사하세요.3.  마지막으로, 학생들이 쉽게 질문을 시작할 수 있도록 아래와 같은 '예시 질문'들을 리스트 형태로 보여주세요:**
   - 📖 **개념 질문:** "[교재의 핵심 용어]의 정의가 뭐야?"
   - 📝 **요약 요청:** "제 1장 내용을 핵심만 요약해 줘."
   - 🎯 **시험 대비:** "이 챕터에서 시험에 나올만한 예상 문제를 만들어 줘."
`;

    if (!COZE_TOKEN) {
        return res.status(500).json({ error: 'Server configuration error: COZE_TOKEN is missing.' });
    }

    try {
        const response = await fetch("https://api.coze.com/open_api/v2/chat", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + COZE_TOKEN,
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
            body: JSON.stringify({
                conversation_id: conversation_id || "default_conv_" + Date.now(),
                bot_id: BOT_ID,
                user: user || "web_user",
                query: SYSTEM_PROMPT + "\n\nUser Question: " + query,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Coze API Error:', response.status, errorText);
            return res.status(response.status).json({ error: 'Coze API Error: ' + response.status + ' ' + errorText });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
};
