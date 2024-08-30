import { CONTRACT_ADDRESS, CONTRACT_ABI } from './abi/contractDetails.js';

let web3Provider, userSigner, contractInstance;

async function initialize() {
    if (window.ethereum) {
        web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
        userSigner = web3Provider.getSigner();
        contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, userSigner);
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('disconnectWallet').style.display = 'inline-block';
        const userAddress = await userSigner.getAddress();
        document.getElementById('walletAddress').innerText = `Connected: ${userAddress}`;
        updateArtworkList();
    } else {
        document.getElementById('status').innerText = 'Please install MetaMask to use this dApp.';
    }
}

function disconnect() {
    web3Provider = null;
    userSigner = null;
    contractInstance = null;
    document.getElementById('walletAddress').innerText = '';
    document.getElementById('connectWallet').style.display = 'inline-block';
    document.getElementById('disconnectWallet').style.display = 'none';
}

async function updateArtworkList() {
    const artworkCount = await contractInstance.artworkCount();
    const artworkListElement = document.getElementById('artworkList');
    artworkListElement.innerHTML = '<h2>Available Artworks</h2>';

    for (let i = 1; i <= artworkCount; i++) {
        const artwork = await contractInstance.artworks(i);
        if (artwork.isForSale) {
            const artworkElement = document.createElement('div');
            artworkElement.className = 'artwork';
            artworkElement.innerHTML = `
                <p>ID: ${artwork.id}</p>
                <p>Title: ${artwork.title}</p>
                <p>Artist: ${artwork.artist}</p>
                <p>Price: ${ethers.utils.formatEther(artwork.price)} ETH</p>
            `;
            artworkListElement.appendChild(artworkElement);
        }
    }
}

document.getElementById('connectWallet').addEventListener('click', initialize);
document.getElementById('disconnectWallet').addEventListener('click', disconnect);

document.getElementById('listArtwork').addEventListener('click', async () => {
    const title = document.getElementById('artworkTitle').value;
    const price = ethers.utils.parseEther(document.getElementById('artworkPrice').value);
    await contractInstance.listArtwork(title, price);
    updateArtworkList();
});

document.getElementById('buyArtwork').addEventListener('click', async () => {
    const id = document.getElementById('artworkId').value;
    const artwork = await contractInstance.artworks(id);
    await contractInstance.buyArtwork(id, { value: artwork.price });
    updateArtworkList();
});

document.getElementById('updatePrice').addEventListener('click', async () => {
    const id = document.getElementById('updateArtworkId').value;
    const newPrice = ethers.utils.parseEther(document.getElementById('newPrice').value);
    await contractInstance.updateArtworkPrice(id, newPrice);
    updateArtworkList();
});
