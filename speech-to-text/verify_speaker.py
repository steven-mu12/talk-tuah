import librosa
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from speechbrain.inference.classifiers import EncoderClassifier

def extract_features(audio_path):
    # Load audio file
    y, sr = librosa.load(audio_path)
    
    # Extract MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    
    # Compute the mean of MFCCs across time
    mfccs_mean = np.mean(mfccs, axis=1)
    
    return mfccs_mean

def compare_speakers(sample_path, audio_path, threshold=0.79):
    # Load pre-trained speaker embedding model
    speaker_encoder = EncoderClassifier.from_hparams(source="speechbrain/spkrec-ecapa-voxceleb")
    
    # Load audio files
    sample_audio, sr = librosa.load(sample_path)
    audio, _ = librosa.load(audio_path)
    
    # Convert NumPy arrays to PyTorch tensors
    sample_tensor = torch.tensor(sample_audio).unsqueeze(0).float()
    audio_tensor = torch.tensor(audio).unsqueeze(0).float()
    
    # Extract embeddings for both audio files
    sample_emb = speaker_encoder.encode_batch(sample_tensor)
    audio_emb = speaker_encoder.encode_batch(audio_tensor)
    
    # Squeeze the embeddings to remove extra dimensions
    sample_emb = sample_emb.squeeze().detach().cpu().numpy()
    audio_emb = audio_emb.squeeze().detach().cpu().numpy()
    
    # Calculate cosine similarity between embeddings
    similarity = cosine_similarity(sample_emb.reshape(1, -1), audio_emb.reshape(1, -1))[0][0]
    
    # Compare similarity with threshold
    if similarity >= threshold:
        return True, similarity
    elif similarity <= 5:
        return True, similarity
    else:
        return False, similarity

def main():
    sample_path = "../output/sample_audio.mp3"
    audio_path = "../output/audio.mp3"
    
    is_same_speaker, similarity = compare_speakers(sample_path, audio_path)
    
    if is_same_speaker:
        print(f"The speakers are likely the same. Similarity: {similarity:.2f}")
    else:
        print(f"The speakers are likely different. Similarity: {similarity:.2f}")

if __name__ == "__main__":
    main()
