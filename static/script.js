document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("email-form");
  const resultDiv = document.getElementById("result");
  const submitBtn = document.getElementById("submit-btn");
  const fileInput = document.getElementById("file_input");
  const uploadBox = document.getElementById("upload-box");
  const fileNameDisplay = document.getElementById("file-name");
  const uploadPlaceholder = document.getElementById("upload-placeholder");
  const uploadPreview = document.getElementById("upload-preview");
  const fileIcon = document.getElementById("file-icon");
  const removeFileBtn = document.getElementById("remove-file");
  const emailTextarea = document.getElementById("email_text");

  const showFilePreview = (file) => {
    uploadPlaceholder.classList.add("hidden");
    uploadPreview.classList.remove("hidden");
    uploadBox.classList.add("active");

    fileNameDisplay.innerText = file.name;

    if (file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
      fileIcon.innerText = "📄";
    } else {
      fileIcon.innerText = "📁";
    }
  };

  const resetForm = () => {
    emailTextarea.value = "";
    fileInput.value = "";

    uploadPreview.classList.add("hidden");
    uploadPlaceholder.classList.remove("hidden");
    uploadBox.classList.remove("active");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailText = emailTextarea.value.trim();
    const file = fileInput.files[0];

    if (!emailText && !file) {
      resultDiv.innerHTML = `
        <div class="error-message">
          Você precisa inserir um texto ou enviar um arquivo para análise.
        </div>
      `;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Analisando...";

    resultDiv.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        Processando com IA...
      </div>
    `;

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: emailText }),
        });
      }

      const data = await response.json();

      const categoryClass =
        data.category === "Produtivo" ? "produtivo" : "improdutivo";

      resultDiv.innerHTML = `
        <div class="result-card ${categoryClass}">
          <span class="category ${categoryClass}">
            ${data.category}
          </span>
          <p><strong>Resposta sugerida:</strong></p>
          <div class="suggested-reply">${data.suggested_reply}</div>
        </div>
      `;

      resetForm();
    } catch (error) {
      resultDiv.innerHTML = `
        <div class="error-message">
          Erro ao analisar o e-mail. Tente novamente.
        </div>
      `;
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Analisar e-mail";
    }
  });

  uploadBox.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      showFilePreview(fileInput.files[0]);
    }
  });

  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "#ff7609";
    uploadBox.style.backgroundColor = "rgba(255, 118, 9, 0.08)";
  });

  uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.borderColor = "#dce3ef";
    uploadBox.style.backgroundColor = "#f8faff";
  });

  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    showFilePreview(fileInput.files[0]);
  });

  removeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.value = "";
    uploadPreview.classList.add("hidden");
    uploadPlaceholder.classList.remove("hidden");
    uploadBox.classList.remove("active");
  });
});
