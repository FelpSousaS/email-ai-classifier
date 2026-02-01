document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("email-form");
  const submitBtn = document.getElementById("submit-btn");

  const fileInput = document.getElementById("file_input");
  const uploadBox = document.getElementById("upload-box");
  const fileNameDisplay = document.getElementById("file-name");
  const uploadPlaceholder = document.getElementById("upload-placeholder");
  const uploadPreview = document.getElementById("upload-preview");
  const removeFileBtn = document.getElementById("remove-file");
  const emailTextarea = document.getElementById("email_text");

  const tabPaste = document.getElementById("tab-paste");
  const tabUpload = document.getElementById("tab-upload");
  const pastePane = document.getElementById("paste-pane");
  const uploadPane = document.getElementById("upload-pane");

  const themeToggle = document.getElementById("theme-toggle");

  const grid =
    document.getElementById("grid") || document.querySelector(".grid");

  const resultPanel = document.getElementById("result-panel");
  const classificationPanel = document.getElementById("classification-panel");
  const replyPanel = document.getElementById("reply-panel");

  const resultDiv = document.getElementById("result");

  const categoryBadge = document.getElementById("category-badge");
  const categoryText = document.getElementById("category-text");
  const confidenceValue = document.getElementById("confidence-value");
  const confidenceBar = document.getElementById("confidence-bar");

  const reasonsWrap = document.getElementById("reasons");
  const reasonsList = document.getElementById("reasons-list");

  const suggestedReplyEl = document.getElementById("suggested-reply");
  const copyBtn = document.getElementById("copy-reply");
  const copyToast = document.getElementById("copy-toast");

  const inlineError = document.getElementById("inline-error");
  const inlineErrorText = document.getElementById("inline-error-text");

  /* =========================================================
     CONSTANTS / VALIDATION RULES
     ========================================================= */
  const ALLOWED_TYPES = ["text/plain", "application/pdf"];

  const MIN_PDF_BYTES = 1024; // 1KB

  /* =========================================================
     HELPERS (GENERAL)
     ========================================================= */
  const clampInt = (val, min, max) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return null;
    const i = Math.round(n);
    return Math.min(max, Math.max(min, i));
  };

  /* =========================================================
     TABS (PASTE/UPLOAD)
     ========================================================= */
  const setTab = (tab) => {
    const isPaste = tab === "paste";
    tabPaste.classList.toggle("is-active", isPaste);
    tabUpload.classList.toggle("is-active", !isPaste);
    pastePane.classList.toggle("hidden", !isPaste);
    uploadPane.classList.toggle("hidden", isPaste);
  };

  /* =========================================================
     UPLOAD PREVIEW UI
     ========================================================= */
  const showFilePreview = (file) => {
    uploadPlaceholder.classList.add("hidden");
    uploadPreview.classList.remove("hidden");
    uploadBox.classList.add("active");
    fileNameDisplay.innerText = file.name;
  };

  const clearFilePreview = () => {
    fileInput.value = "";
    uploadPreview.classList.add("hidden");
    uploadPlaceholder.classList.remove("hidden");
    uploadBox.classList.remove("active");
    fileNameDisplay.innerText = "";
  };

  /* =========================================================
     THEME (LIGHT/DARK)
     ========================================================= */
  const applyTheme = (mode) => {
    document.body.classList.toggle("dark", mode === "dark");
    themeToggle.innerHTML =
      mode === "dark"
        ? `
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
        : `
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.8 6.8 0 1 0 9.8 9.8Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      `;
  };

  const storedTheme = localStorage.getItem("theme");
  applyTheme(storedTheme === "dark" ? "dark" : "light");

  themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });

  /* =========================================================
     INLINE ERROR
     ========================================================= */
  const showInlineError = (message) => {
    inlineErrorText.textContent = message;
    inlineError.classList.remove("hidden");
  };

  const clearInlineError = () => {
    inlineError.classList.add("hidden");
    inlineErrorText.textContent = "";
  };

  /* =========================================================
     FILE CONTENT VALIDATION
     ========================================================= */
  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
      reader.readAsText(file);
    });

  const validateFileHasContent = async (file) => {
    if (!file) return { ok: false, message: "Nenhum arquivo selecionado." };

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        ok: false,
        message: "Formato de arquivo não suportado. Envie apenas .txt ou .pdf.",
      };
    }

    if (file.size === 0) {
      return {
        ok: false,
        message: "O arquivo está vazio. Envie um .txt ou .pdf com conteúdo.",
      };
    }

    if (file.type === "text/plain") {
      try {
        const text = await readFileAsText(file);
        if (text.trim().length === 0) {
          return {
            ok: false,
            message:
              "O arquivo .txt não possui conteúdo útil (apenas vazio/espaços).",
          };
        }
      } catch {
        return {
          ok: false,
          message: "Não foi possível ler o .txt. Tente outro arquivo.",
        };
      }
    }

    if (file.type === "application/pdf") {
      if (file.size < MIN_PDF_BYTES) {
        return {
          ok: false,
          message:
            "O .pdf parece estar vazio ou inválido. Envie um PDF com conteúdo.",
        };
      }
    }

    return { ok: true, message: "" };
  };

  /* =========================================================
     PROCESSING UI (LOCK/UNLOCK)
     ========================================================= */
  const setProcessingUI = (isProcessing) => {
    tabPaste.disabled = isProcessing;
    tabUpload.disabled = isProcessing;

    emailTextarea.disabled = isProcessing;

    fileInput.disabled = isProcessing;
    uploadBox.style.pointerEvents = isProcessing ? "none" : "auto";
    uploadBox.style.opacity = isProcessing ? "0.75" : "1";

    const hasFile = fileInput.files && fileInput.files.length > 0;
    if (hasFile) {
      removeFileBtn.disabled = isProcessing;
      removeFileBtn.style.opacity = isProcessing ? "0.5" : "1";
      removeFileBtn.style.cursor = isProcessing ? "not-allowed" : "pointer";
    } else {
      removeFileBtn.disabled = true;
      removeFileBtn.style.opacity = "0.5";
      removeFileBtn.style.cursor = "not-allowed";
    }
  };

  /* =========================================================
     RIGHT PANEL MODES (EMPTY/SINGLE/SPLIT)
     ========================================================= */
  const setRightMode = (mode) => {
    if (mode === "single") {
      grid.setAttribute("data-right", "single");
      resultPanel.classList.remove("hidden");
      classificationPanel.classList.add("hidden");
      replyPanel.classList.add("hidden");
      return;
    }
    grid.setAttribute("data-right", "split");
    resultPanel.classList.add("hidden");
    classificationPanel.classList.remove("hidden");
    replyPanel.classList.remove("hidden");
  };

  const setEmptyState = () => {
    setRightMode("single");
    resultDiv.innerHTML = `
      <div class="empty">
        <div class="empty-icon" aria-hidden="true">
          <svg class="icon icon-xl" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16v10H4V7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="empty-title">Nenhum email processado</p>
        <p class="empty-subtitle">
          Cole o texto de um email ou faça upload de um arquivo para começar a análise.
        </p>
        <p class="empty-hint">← Use o painel à esquerda para inserir um email</p>
      </div>
    `;
  };

  const setProcessingState = (stepIndex = 0) => {
    setRightMode("single");

    const steps = [
      {
        label: "Analisando conteúdo...",
        state: stepIndex > 0 ? "done" : stepIndex === 0 ? "active" : "",
      },
      {
        label: "Classificando email...",
        state: stepIndex > 1 ? "done" : stepIndex === 1 ? "active" : "",
      },
      { label: "Gerando resposta...", state: stepIndex === 2 ? "active" : "" },
    ];

    resultDiv.innerHTML = `
      <div class="processing">
        <div class="processing-ring" aria-hidden="true">
          <div class="spinner-big"></div>
        </div>
        <p class="processing-title">Processando email</p>
        <div class="processing-steps">
          ${steps
            .map((s) => {
              const icon = s.state === "done" ? "✓" : "•";
              return `
              <div class="step ${s.state}">
                <span class="dot" aria-hidden="true">${icon}</span>
                <span>${s.label}</span>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  };

  /* =========================================================
     RENDER (CLASSIFICATION / REPLY)
     ========================================================= */
  const renderClassification = ({ category, confidence, reasons }) => {
    const isProd = category === "Produtivo";

    categoryBadge.classList.toggle("produtivo", isProd);
    categoryBadge.classList.toggle("improdutivo", !isProd);

    categoryText.textContent = typeof category === "string" ? category : "-";

    const conf = clampInt(confidence, 0, 100) ?? 0;
    confidenceValue.textContent = `${conf}%`;
    confidenceBar.style.width = `${conf}%`;
    confidenceBar.style.background = isProd ? "#16a34a" : "#dc2626";

    reasonsList.innerHTML = "";
    if (Array.isArray(reasons) && reasons.length > 0) {
      reasonsWrap.classList.remove("hidden");
      reasons
        .slice(0, 4)
        .filter((r) => typeof r === "string" && r.trim().length > 0)
        .forEach((r) => {
          const li = document.createElement("li");
          li.textContent = r.trim();
          reasonsList.appendChild(li);
        });

      if (!reasonsList.childElementCount) {
        reasonsWrap.classList.add("hidden");
      }
    } else {
      reasonsWrap.classList.add("hidden");
    }
  };

  const renderReply = ({ suggested_reply }) => {
    suggestedReplyEl.textContent =
      typeof suggested_reply === "string" ? suggested_reply : "";
  };

  /* =========================================================
     CLIPBOARD
     ========================================================= */
  const copyTextToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      try {
        const tmp = document.createElement("textarea");
        tmp.value = text;
        tmp.setAttribute("readonly", "");
        tmp.style.position = "absolute";
        tmp.style.left = "-9999px";
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        return true;
      } catch {
        return false;
      }
    }
  };

  const setToast = () => {
    copyToast.classList.remove("hidden");
    setTimeout(() => copyToast.classList.add("hidden"), 1500);
  };

  copyBtn.addEventListener("click", async () => {
    const ok = await copyTextToClipboard(suggestedReplyEl.innerText);
    if (ok) setToast();
  });

  /* =========================================================
     INIT STATE
     ========================================================= */
  setTab("paste");
  setEmptyState();
  clearInlineError();
  setProcessingUI(false);

  /* =========================================================
     EVENTS: TAB NAVIGATION
     ========================================================= */
  tabPaste.addEventListener("click", () => {
    if (tabPaste.disabled) return;
    setTab("paste");
    clearInlineError();
  });

  tabUpload.addEventListener("click", () => {
    if (tabUpload.disabled) return;
    setTab("upload");
    clearInlineError();
  });

  /* =========================================================
     EVENTS: FORM SUBMIT (PROCESS)
     ========================================================= */
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailText = emailTextarea.value.trim();
    const file = fileInput.files[0];

    if (!emailText && !file) {
      showInlineError(
        "Por favor, insira o texto do email ou faça upload de um arquivo.",
      );
      return;
    }

    // validando o arquivo ANTES de spinner/backend
    if (file) {
      const check = await validateFileHasContent(file);
      if (!check.ok) {
        showInlineError(check.message);
        clearFilePreview();
        setProcessingUI(false);
        setTab("upload");
        return;
      }
    }

    clearInlineError();

    submitBtn.disabled = true;
    submitBtn.innerText = "Processando...";
    setProcessingUI(true);

    setProcessingState(0);
    const t1 = setTimeout(() => setProcessingState(1), 600);
    const t2 = setTimeout(() => setProcessingState(2), 1200);

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        response = await fetch("/analyze-file", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: emailText }),
        });
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      renderClassification({
        category: data.category,
        confidence: data.confidence,
        reasons: data.reasons,
      });

      renderReply({ suggested_reply: data.suggested_reply });

      setRightMode("split");
    } catch (error) {
      console.error(error);
      setEmptyState();
      showInlineError("Não foi possível processar. Tente novamente.");
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);

      setProcessingUI(false);

      submitBtn.disabled = false;
      submitBtn.innerText = "Processar Email";
    }
  });

  /* =========================================================
     EVENTS: UPLOAD (CLICK / CHANGE / DND)
     ========================================================= */
  uploadBox.addEventListener("click", () => {
    if (fileInput.disabled) return;
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const check = await validateFileHasContent(file);
    if (!check.ok) {
      showInlineError(check.message);
      fileInput.value = "";
      clearFilePreview();
      return;
    }

    clearInlineError();
    showFilePreview(file);
    setTab("upload");
    setProcessingUI(false);
  });

  uploadBox.addEventListener("dragover", (e) => {
    if (fileInput.disabled) return;
    e.preventDefault();
    uploadBox.style.borderColor = "rgba(254, 137, 7, 0.65)";
    uploadBox.style.backgroundColor = "rgba(254, 137, 7, 0.08)";
  });

  uploadBox.addEventListener("dragleave", () => {
    if (fileInput.disabled) return;
    uploadBox.style.borderColor = "#e6ebf5";
    uploadBox.style.backgroundColor = "#f8faff";
  });

  uploadBox.addEventListener("drop", async (e) => {
    e.preventDefault();
    if (fileInput.disabled) return;

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const check = await validateFileHasContent(file);
    if (!check.ok) {
      showInlineError(check.message);
      clearFilePreview();
      return;
    }

    clearInlineError();

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    showFilePreview(file);
    setTab("upload");
    setProcessingUI(false);
  });

  /* =========================================================
     EVENTS: REMOVE FILE
     ========================================================= */
  removeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (removeFileBtn.disabled) return;
    clearFilePreview();
    clearInlineError();
    setProcessingUI(false);
  });

  /* =========================================================
     EVENTS: INPUT FEEDBACK
     ========================================================= */
  emailTextarea.addEventListener("input", () => {
    if (emailTextarea.value.trim().length > 0) clearInlineError();
  });
});
