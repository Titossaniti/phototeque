// GET images
const imageAPILink = 'https://photos-api-sepia.vercel.app/photos';

async function fetchAPI() {
    try {
        const response = await fetch(imageAPILink);
        if (!response.ok) new Error(`Erreur de lecture de l'API: HTTP error! Status: ${response.status}`);
        // Lance une erreur si la réponse est échouée
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

// DELETE image

async function deleteImage(id) {
    try {
        const response = await fetch(`${imageAPILink}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Erreur de suppression de l'image: HTTP error! Status: ${response.status}`);
        // Lance une erreur si la réponse est échouée
        console.log(`Image avec l'ID ${id} supprimée avec succès.`);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image:', error);
    }
}

// POST image
async function addImage(description, url) {
    try {
        const response = await fetch(imageAPILink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, url })
        });
        if (!response.ok) throw new Error(`Erreur d'ajout de l'image: HTTP error! Status: ${response.status}`);
        // Lance une erreur si la réponse est échouée
        const newImage = await response.json();
        console.log('Image ajoutée avec succès:', newImage);
        location.reload();
        return newImage;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'image:', error);
    }
}

// PUT description pour mettre à jour
async function updateDesc(id, description) {
    try {
        // Récupère l'objet actuel depuis l'API
        const response = await fetch(`${imageAPILink}/${id}`);
        if (!response.ok) throw new Error(`Erreur lors de la récupération de l'image: HTTP error! Status: ${response.status}`);

        const currentData = await response.json();

        // Crée un nouvel objet avec la description mise à jour
        const updatedData = {
            ...currentData,
            description: description
        };

        // Envoie la requête PUT avec les données mises à jour
        const responsePut = await fetch(`${imageAPILink}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData)
        });

        if (!responsePut.ok) throw new Error(`Erreur dans la requête HTTP ! statut : ${responsePut.status}`);

        const result = await responsePut.json();
        console.log('Description mise à jour avec succès:', result);
        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la description:', error);
    }
}

//POST button event
const form = document.querySelector('form');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêcher le formulaire de se soumettre normalement

    const inputURL = document.getElementById('inputURL').value;
    const inputDesc = document.getElementById('inputDesc').value;

    // Appeler la fonction addImage avec les valeurs des champs d'entrée
    await addImage(inputDesc, inputURL);
});

// Ajouter un événement d'entrée à votre champ de recherche
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', displayItem);


// Afficher la liste des images
async function displayItem() {
    // Obtenir le texte de recherche en minuscules
    const searchText = searchInput.value.toLowerCase();
    const imgListElement = document.getElementById('imgLibrary');
    const images = await fetchAPI();
    imgListElement.innerHTML = '';

    // Boucle à travers chaque image et crée une card pour chacune
    images.forEach(img => {
        if (img.description.toLowerCase().includes(searchText)) {
            //Créé la DIV parente
            const listItem = document.createElement('div');
            listItem.classList.add('col', 'cardBlock');
            imgListElement.appendChild(listItem);

            // Créé une div enfant
            const contentBody = document.createElement('div');
            contentBody.classList.add('card', 'contentBody' ,'shadow');

            // Ajoute la div enfant à la div listItem
            listItem.appendChild(contentBody);

            // Créé un p enfant DEVRA ETRE UN IMG
            const imgTag = document.createElement('img');
            imgTag.classList.add('card-img-top', 'imgBody');
            imgTag.setAttribute('src', `${img.url}`);

            // Ajoute le img enfant à la div contentBody
            contentBody.appendChild(imgTag);

            // Créé une div enfant
            const descBody = document.createElement('div');
            descBody.classList.add('card-body', 'descBody');

            // Ajoute la div enfant à la div contentBody
            contentBody.appendChild(descBody);

            // Créé un p enfant POUR AFFICHER LA DESCRIPTION
            const descContent = document.createElement('p');
            descContent.classList.add('card-img-top', 'imgBody');
            descContent.textContent = `${img.description}`;

            // Ajoute le p enfant à la div descBody
            descBody.appendChild(descContent);

            // Créé une div pour les boutons
            const buttonBody = document.createElement('div');
            buttonBody.classList.add('card-body', 'text-end');

            // Ajoute la div pour les boutons en enfant de la div contentBody
            contentBody.appendChild(buttonBody);

            //Créé un bouton UPDATE
            const updateButton = document.createElement('button');
            updateButton.setAttribute('type', `button`);
            updateButton.classList.add('btn', 'btn-outline-info');
            updateButton.textContent = `Mettre à jour`;

            //Ajoute un bouton UPDATE à chaque image
            buttonBody.appendChild(updateButton);

            // Ajouter l'evenement pour mettre à jour une description
            updateButton.addEventListener('click', async () => {
                document.getElementById('updateTextarea').value = img.description;
                document.getElementById('saveUpdateButton').dataset.imageId = img.id;

                // Afficher le modal
                const updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
                updateModal.show();
            });

            // Evenement pour le bouton "enregistrer les modifiications"
            document.getElementById('saveUpdateButton').addEventListener('click', async () => {
                const newDescription = document.getElementById('updateTextarea').value;
                const imageId = document.getElementById('saveUpdateButton').dataset.imageId;

                const updatedImage = await updateDesc(imageId, newDescription);

                if (updatedImage) {
                    const imgCard = document.querySelector(`[data-image-id='${imageId}'] .descBody p`);
                    if (imgCard) {
                        imgCard.textContent = updatedImage.description;
                        // cacher le modal
                        const updateModal = bootstrap.Modal.getInstance(document.getElementById('updateModal'));
                        updateModal.hide();

                    }
                }

            });
            listItem.dataset.imageId = img.id;

            //Créé un bouton DELETE
            const deleteButton = document.createElement('button');
            deleteButton.setAttribute('type', `button`);
            deleteButton.classList.add('btn', 'btn-outline-danger', 'ms-1');
            deleteButton.textContent = `Supprimer`;

            // Ajoute un bouton DELETE à chaque image
            buttonBody.appendChild(deleteButton);

            // Ajouter un événements pour le bouton DELETE
            deleteButton.addEventListener('click', async () => {
                await deleteImage(img.id);
                // Supprimer l'élément de la DOM après la suppression
                listItem.remove();
            });
        }

    });
}
displayItem();