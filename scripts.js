// LOGIN e LOGOUT
const loginContainer = document.getElementById('loginContainer');
const diarioContainer = document.getElementById('diarioContainer');
const senhaInput = document.getElementById('senhaInput');
const loginBtn = document.getElementById('loginBtn');
const msgErro = document.getElementById('msgErro');
const logoutBtn = document.getElementById('logoutBtn');

const SENHA_CORRETA = 'Gaby'; // senha fixa

loginBtn.addEventListener('click', () => {
  const senha = senhaInput.value.trim();
  if (senha === SENHA_CORRETA) {
    loginContainer.style.display = 'none';
    diarioContainer.style.display = 'block';
    msgErro.style.display = 'none';
    senhaInput.value = '';
  } else {
    msgErro.textContent = 'Senha incorreta. Tente novamente.';
    msgErro.style.display = 'block';
  }
});

senhaInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    loginBtn.click();
  }
});

logoutBtn.addEventListener('click', () => {
  diarioContainer.style.display = 'none';
  loginContainer.style.display = 'block';
});

// Abas
const tabs = document.querySelectorAll('.tab');
const historiaContent = document.getElementById('historiaContent');
const videosContent = document.getElementById('videosContent');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.tab === 'historia') {
      historiaContent.style.display = 'block';
      videosContent.style.display = 'none';
    } else {
      historiaContent.style.display = 'none';
      videosContent.style.display = 'block';
    }
  });
});

// História
const historiaText = document.getElementById('historiaText');
const salvarHistoriaBtn = document.getElementById('salvarHistoriaBtn');

if(localStorage.getItem('minhaHistoria')) {
  historiaText.value = localStorage.getItem('minhaHistoria');
}

salvarHistoriaBtn.onclick = () => {
  localStorage.setItem('minhaHistoria', historiaText.value);
  alert('História salva!');
};

// Vídeos - IndexedDB
let db;
const request = indexedDB.open('videosDB', 1);

request.onupgradeneeded = e => {
  db = e.target.result;
  if (!db.objectStoreNames.contains('videos')) {
    db.createObjectStore('videos', { keyPath: 'id', autoIncrement: true });
  }
};

request.onsuccess = e => {
  db = e.target.result;
  carregarVideos();
};

request.onerror = e => {
  alert('Erro ao abrir banco de vídeos');
};

const videoInput = document.getElementById('videoInput');
const anexarVideoBtn = document.getElementById('anexarVideoBtn');
const videoList = document.getElementById('videoList');

anexarVideoBtn.onclick = () => {
  if(videoInput.files.length === 0) {
    alert('Escolha um vídeo primeiro!');
    return;
  }
  const file = videoInput.files[0];
  const transaction = db.transaction(['videos'], 'readwrite');
  const store = transaction.objectStore('videos');
  store.add({name: file.name, blob: file});
  transaction.oncomplete = () => {
    videoInput.value = '';
    carregarVideos();
    alert('Vídeo salvo!');
  };
  transaction.onerror = () => {
    alert('Erro ao salvar vídeo');
  };
};

function carregarVideos() {
  videoList.innerHTML = '';
  const transaction = db.transaction(['videos'], 'readonly');
  const store = transaction.objectStore('videos');
  const request = store.openCursor();

  request.onsuccess = e => {
    const cursor = e.target.result;
    if(cursor) {
      const videoData = cursor.value;
      const url = URL.createObjectURL(videoData.blob);

      const videoDiv = document.createElement('div');
      videoDiv.classList.add('video-item');

      const titulo = document.createElement('p');
      titulo.textContent = videoData.name;

      const video = document.createElement('video');
      video.controls = true;
      video.src = url;

      const btnRemover = document.createElement('button');
      btnRemover.textContent = 'Remover';

      btnRemover.onclick = () => {
        if(confirm(`Remover o vídeo "${videoData.name}"?`)) {
          const deleteTransaction = db.transaction(['videos'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('videos');
          deleteStore.delete(videoData.id);
          deleteTransaction.oncomplete = () => {
            carregarVideos();
            alert('Vídeo removido!');
          };
          deleteTransaction.onerror = () => {
            alert('Erro ao remover vídeo');
          };
        }
      };

      videoDiv.appendChild(titulo);
      videoDiv.appendChild(video);
      videoDiv.appendChild(btnRemover);

      videoList.appendChild(videoDiv);

      cursor.continue();
    }
  };
}

// Navegação horizontal vídeos
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');

btnPrev.onclick = () => {
  videoList.scrollBy({left: -300, behavior: 'smooth'});
};

btnNext.onclick = () => {
  videoList.scrollBy({left: 300, behavior: 'smooth'});
};
