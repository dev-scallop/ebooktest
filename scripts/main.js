/**
 * Main Application Script
 * Handles tab switching, panel toggling, and basic UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    initMainTabs();
    initPanelTabs();
    initTOC();
    initNavigation();
    initChat(); // Initialize Chat
});

let currentChapter = 1;

/**
 * Initialize Main Viewer Tabs (Textbook, Easy Guide, Quiz, AI)
 */
function initMainTabs() {
    const tabs = document.querySelectorAll('.viewer-tabs .tab-btn');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('Tab clicked:', tab.dataset.tab);

            // 1. Update Tab State
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            tab.classList.add('active');

            // 2. Show Corresponding View
            const tabType = tab.dataset.tab; // textbook, guide, quiz

            // Hide all main views
            const allSections = document.querySelectorAll('.content-area > article');
            allSections.forEach(el => {
                el.classList.add('hidden');
                el.classList.remove('active');
            });

            // Show specific view based on type
            let targetViewId = '';
            if (tabType === 'textbook') {
                targetViewId = `chapter-${currentChapter}-textbook`;
            } else {
                targetViewId = `view-${tabType}`;
            }

            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                targetView.classList.remove('hidden');
                targetView.classList.add('active');
            } else {
                console.warn(`Target view not found: ${targetViewId}`);
            }
        });
    });
}

/**
 * Initialize Right Helper Panel Tabs
 */
function initPanelTabs() {
    const tabs = document.querySelectorAll('.panel-tabs .panel-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 1. Update Tab State
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 2. Show Corresponding Panel
            const panelType = tab.dataset.panel; // memo, ai, dict

            // Hide all panels
            document.querySelectorAll('.sidebar-panel').forEach(el => {
                el.classList.remove('active');
            });

            // Show specific panel
            const targetPanel = document.getElementById(`panel-${panelType}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

/**
 * Initialize TOC Selection
 */
function initTOC() {
    const items = document.querySelectorAll('.toc-item');

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            console.log('TOC item clicked:', item.dataset.chapter);
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Switch Chapter
            const chapter = parseInt(item.dataset.chapter);
            switchChapter(chapter);
        });
    });
}

/**
 * Initialize Bottom Navigation (Prev/Next)
 */
function initNavigation() {
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentChapter > 1) {
                switchChapter(currentChapter - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Assuming max 4 chapters for this demo
            if (currentChapter < 4) {
                switchChapter(currentChapter + 1);
            }
        });
    }
}

/**
 * Switch to a specific chapter
 */
function switchChapter(chapterNum) {
    console.log('Switching to chapter:', chapterNum);
    currentChapter = chapterNum;

    // 1. Update TOC Active State
    document.querySelectorAll('.toc-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.chapter) === chapterNum);
    });

    // 2. Update Progress Bar (Mock)
    const progress = (chapterNum / 4) * 100;
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${chapterNum * 12} / 45 페이지`;

    // 3. Update Chat Context (Optional)
    const chatBubble = document.querySelector('.message.bot .bubble');
    if (chatBubble) {
        // Only update if it's the initial greeting
        if (chatBubble.textContent.includes('안녕하세요! AI 튜터입니다.')) {
            chatBubble.textContent = `안녕하세요! AI 튜터입니다. ${chapterNum}장에 대해 궁금한 점이 있으신가요?`;
        }
    }
}


// --- Chat Functionality ---

const SESSION_ID = 'web_session_' + Date.now();

function initChat() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

function appendMessage(role, text) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const div = document.createElement('div');
    div.className = `message ${role}`;

    // Render Markdown using marked.js if available, otherwise plain text
    if (typeof marked !== 'undefined') {
        div.innerHTML = marked.parse(text);
    } else {
        div.textContent = text;
    }

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendLoading() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const div = document.createElement('div');
    div.id = 'typingIndicator';
    div.className = 'typing-indicator';
    div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoading() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    if (!chatInput) return;

    const query = chatInput.value.trim();
    if (!query) return;

    // 1. User message
    appendMessage('user', query);
    chatInput.value = '';
    chatInput.disabled = true;
    if (chatSendBtn) chatSendBtn.disabled = true;

    // 2. Loading
    appendLoading();

    try {
        // 3. Call Serverless Function
        const res = await fetch('/api/coze-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                conversation_id: SESSION_ID
            })
        });

        removeLoading();

        if (!res.ok) {
            let errorMsg = 'Server error: ' + res.status;
            try {
                const errData = await res.json();
                if (errData.error) errorMsg = errData.error;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        const data = await res.json();

        // Parse Coze response
        let answer = "죄송합니다. 답변을 가져올 수 없습니다.";
        if (Array.isArray(data.messages)) {
            const answerMsg = data.messages.find(m => m.role === 'assistant' && m.type === 'answer');
            if (answerMsg && answerMsg.content) {
                answer = answerMsg.content;
            }
        } else if (data.error) {
            answer = "오류 발생: " + data.error;
        }

        appendMessage('bot', answer);

    } catch (e) {
        removeLoading();
        appendMessage('bot', '오류가 발생했습니다: ' + e.message);
    } finally {
        chatInput.disabled = false;
        if (chatSendBtn) chatSendBtn.disabled = false;
        chatInput.focus();
    }
}
