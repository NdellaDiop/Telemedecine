import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Slider,
} from '@mui/material';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Brightness6 as BrightnessIcon,
    Contrast as ContrastIcon,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';

const DoctorImaging = () => {
    const [dicomFiles, setDicomFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [imageUrl, setImageUrl] = useState(null);

    // Charger les fichiers DICOM disponibles
    useEffect(() => {
        const fetchDicomFiles = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/doctor/dicom-files');
                setDicomFiles(response.data);
                console.log("✅ Fichiers DICOM chargés:", response.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError("Session expirée ou non autorisé. Veuillez vous reconnecter.");
                } else {
                    setError("Erreur lors du chargement des fichiers DICOM");
                }
                console.error("❌ Erreur lors du chargement des fichiers DICOM:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDicomFiles();
    }, []);

    // Charger l'image JPEG quand un fichier est sélectionné
    useEffect(() => {
        const loadPreviewImage = async () => {
            if (selectedFile) {
                setLoading(true);
                try {
                    const response = await axiosInstance.get(`/api/doctor/dicom-preview/${selectedFile.id}`, {
                        responseType: 'blob', // Important: on attend un blob (image binaire)
                    });
                    const url = URL.createObjectURL(response.data);
                    setImageUrl(url);
                    console.log("🔍 Fichier DICOM sélectionné:", selectedFile);
                    console.log("🖼️ URL de l'image générée (Blob URL):", url);
                } catch (err) {
                    if (err.response && err.response.status === 401) {
                        setError("Session expirée ou non autorisé. Veuillez vous reconnecter.");
                    } else {
                        setError("Erreur lors du chargement de l'image de prévisualisation.");
                    }
                    console.error("❌ Erreur lors du chargement de l'image de prévisualisation:", err);
                    setImageUrl(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setImageUrl(null);
                console.log("🚫 Aucun fichier DICOM sélectionné.");
            }
        };
        loadPreviewImage();

        // Nettoyer l'URL de l'objet quand le composant est démonté ou qu'un nouveau fichier est sélectionné
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [selectedFile]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 0.5));
    };

    const handleBrightnessChange = (event, newValue) => {
        setBrightness(newValue);
    };

    const handleContrastChange = (event, newValue) => {
        setContrast(newValue);
    };

    const imageStyle = {
        width: '100%',
        height: 'auto',
        transform: `scale(${zoom})`,
        filter: `brightness(${1 + brightness/100}) contrast(${1 + contrast/100})`,
        transition: 'transform 0.3s ease-in-out',
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Imagerie Médicale
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Liste des fichiers DICOM */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Fichiers DICOM
                        </Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            dicomFiles.map((file) => (
                                <Card key={file.id} sx={{ mb: 1 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1">
                                            {file.file_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Patient: {file.patient_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Date: {new Date(file.created_at).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Modalité: {file.modality}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => {
                                                console.log("👆 Clic sur le fichier:", file);
                                                setSelectedFile(file);
                                            }}
                                            disabled={loading}
                                        >
                                            Afficher
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))
                        )}
                    </Paper>
                </Grid>

                {/* Zone de visualisation */}
                <Grid item xs={12} md={9}>
                    <Paper sx={{ p: 2, height: 'calc(100vh - 100px)', position: 'relative' }}>
                        {selectedFile ? (
                            <>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        backgroundColor: 'black',
                                    }}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`DICOM ${selectedFile.file_name}`}
                                        style={imageStyle}
                                    />
                                </Box>
                                
                                {/* Barre d'outils */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        borderRadius: 1,
                                        p: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                    }}
                                >
                                    <Tooltip title="Zoom +">
                                        <IconButton onClick={handleZoomIn}>
                                            <ZoomInIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Zoom -">
                                        <IconButton onClick={handleZoomOut}>
                                            <ZoomOutIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Luminosité">
                                        <IconButton>
                                            <BrightnessIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Contraste">
                                        <IconButton>
                                            <ContrastIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {/* Contrôles de luminosité et contraste */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 16,
                                        left: 16,
                                        right: 16,
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        borderRadius: 1,
                                        p: 2,
                                    }}
                                >
                                    <Typography variant="subtitle2" color="white" gutterBottom>
                                        Luminosité
                                    </Typography>
                                    <Slider
                                        value={brightness}
                                        onChange={handleBrightnessChange}
                                        min={-100}
                                        max={100}
                                        sx={{ color: 'white' }}
                                    />
                                    <Typography variant="subtitle2" color="white" gutterBottom>
                                        Contraste
                                    </Typography>
                                    <Slider
                                        value={contrast}
                                        onChange={handleContrastChange}
                                        min={-100}
                                        max={100}
                                        sx={{ color: 'white' }}
                                    />
                                </Box>
                            </>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                }}
                            >
                                <Typography variant="h6" color="text.secondary">
                                    Sélectionnez un fichier DICOM à afficher
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DoctorImaging; 