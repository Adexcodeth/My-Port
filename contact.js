const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");
const whatsappButton = document.querySelector("[data-whatsapp-button]");
const whatsappNumber = "2347076028386";

function openWhatsApp() {
    const formData = Object.fromEntries(new FormData(contactForm));
    const whatsappMessage = [
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        "",
        formData.message
    ].join("\n");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

if (contactForm && contactStatus && whatsappButton) {
    whatsappButton.addEventListener("click", () => {
        if (!contactForm.reportValidity()) return;
        openWhatsApp();
        contactStatus.textContent = "WhatsApp opened with your message ready to send.";
    });
}
