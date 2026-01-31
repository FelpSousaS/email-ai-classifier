const form = document.getElementById("email-form");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  resultDiv.innerText = "Analisando e-mail...";

  const emailText = document.getElementById("email_text").value;
  const fileInput = document.getElementById("file_input");
  const file = fileInput.files[0];

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

    resultDiv.innerHTML = `
      <p><strong>Categoria:</strong> ${data.category}</p>
      <p><strong>Resposta sugerida:</strong></p>
      <div class="suggested-reply">${data.suggested_reply}</div>
    `;
  } catch (error) {
    resultDiv.innerText = "Erro ao analisar o e-mail.";
    console.error(error);
  }
});
