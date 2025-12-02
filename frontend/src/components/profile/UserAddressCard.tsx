import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext.tsx";
import { UserProfile, profileService } from "../../services/profileService";
import { useState, useEffect } from "react";



export default function UserAddressCard() {
    const { isOpen, openModal, closeModal } = useModal();
    const auth = useAuth();
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    useEffect(() => {
        if (auth.userProfile) {
            setFormData({
                address: auth.userProfile.address || {
                    postalCode: '',
                    city: '',
                    country: ''
                }
            });
        }
        setErrors({});
        setSuccessMessage('');
        setErrorMessage('');
    }, [auth.userProfile, isOpen]);

    // Validation des champs
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validation du pays
        if (formData.address?.country) {
            if (formData.address.country.trim().length < 2) {
                newErrors.country = 'Le nom du pays doit contenir au moins 2 caractères';
            }
            if (formData.address.country.length > 100) {
                newErrors.country = 'Le nom du pays ne peut pas dépasser 100 caractères';
            }
            // Vérifier que le pays ne contient que des lettres, espaces et tirets
            if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(formData.address.country)) {
                newErrors.country = 'Le nom du pays ne peut contenir que des lettres';
            }
        }

        // Validation de la ville
        if (formData.address?.city) {
            if (formData.address.city.trim().length < 2) {
                newErrors.city = 'Le nom de la ville doit contenir au moins 2 caractères';
            }
            if (formData.address.city.length > 100) {
                newErrors.city = 'Le nom de la ville ne peut pas dépasser 100 caractères';
            }
            // Vérifier que la ville ne contient que des lettres, espaces et tirets
            if (!/^[a-zA-ZÀ-ÿ0-9\s-]+$/.test(formData.address.city)) {
                newErrors.city = 'Le nom de la ville contient des caractères invalides';
            }
        }

        // Validation du code postal
        if (formData.address?.postalCode) {
            const postalCode = formData.address.postalCode.trim();

            if (postalCode.length < 3) {
                newErrors.postalCode = 'Le code postal doit contenir au moins 3 caractères';
            }
            if (postalCode.length > 10) {
                newErrors.postalCode = 'Le code postal ne peut pas dépasser 10 caractères';
            }
            // Vérifier que le code postal ne contient que des chiffres, lettres et tirets
            if (!/^[a-zA-Z0-9\s-]+$/.test(postalCode)) {
                newErrors.postalCode = 'Le code postal contient des caractères invalides';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        setSuccessMessage('');
        setErrorMessage('');

        if (!validateForm()) {
            setErrorMessage('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setIsLoading(true);
        try {
            const savedProfile = await profileService.createOrUpdateProfile(formData as UserProfile);
            if (savedProfile) {
                auth.setUserProfile(savedProfile);
                setSuccessMessage('Adresse mise à jour avec succès !');
                closeModal();
            }
        } catch (error) {
            console.error('Error saving address:', error);
            setErrorMessage('Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddressChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
        // Effacer l'erreur du champ modifié
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Address</h4>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Country</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {auth.userProfile?.address?.country || 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">City/State</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {auth.userProfile?.address?.city || 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Postal Code</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {auth.userProfile?.address?.postalCode || 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={openModal} className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" > <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" /> </svg>
                        Edit
                    </button>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Address</h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update your address information.
                        </p>

                        {/* Messages de succès et d'erreur */}
                        {successMessage && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{successMessage}</span>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{errorMessage}</span>
                            </div>
                        )}
                    </div>
                    <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="px-2 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <div>
                                    <Label>Country</Label>
                                    <Input
                                        type="text"
                                        value={formData.address?.country || ''}
                                        onChange={(e) => handleAddressChange('country', e.target.value)}
                                        placeholder="e.g. Tunisia"
                                    />
                                    {errors.country && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.country}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>City/State</Label>
                                    <Input
                                        type="text"
                                        value={formData.address?.city || ''}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        placeholder="e.g. Ariana"
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Postal Code</Label>
                                    <Input
                                        type="text"
                                        value={formData.address?.postalCode || ''}
                                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                                        placeholder="e.g. ####"
                                    />
                                    {errors.postalCode && (
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.postalCode}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal} type="button">
                                Close
                            </Button>
                            <Button size="sm" type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}