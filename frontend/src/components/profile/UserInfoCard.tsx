import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext.tsx";
import { UserProfile, profileService } from "../../services/profileService";
import { useState, useEffect } from "react";
import PhoneInput from "../form/group-input/PhoneInput.tsx";

// Define country codes for the phone input
const COUNTRY_CODES = [
    { code: "US", label: "+1" },
    { code: "TN", label: "+216" },
    { code: "FR", label: "+33" },
    { code: "GB", label: "+44" },
    { code: "DE", label: "+49" },
    { code: "ES", label: "+34" },
    { code: "IT", label: "+39" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
    { code: "JP", label: "+81" },
    { code: "CN", label: "+86" },
    { code: "IN", label: "+91" },
];
export default function UserInfoCard() {
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
                firstName: auth.userProfile.firstName || '',
                lastName: auth.userProfile.lastName || '',
                phone: auth.userProfile.phone || '',
                bio: auth.userProfile.bio || '',
                gender: auth.userProfile.gender || '',
                birthDate: auth.userProfile.birthDate || '',
            });
        }
        setErrors({});
        setSuccessMessage('');
        setErrorMessage('');
    }, [auth.userProfile, isOpen]);

    // Validation des champs
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validation du prénom
        if (formData.firstName && formData.firstName.trim().length < 2) {
            newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
        }
        if (formData.firstName && formData.firstName.length > 50) {
            newErrors.firstName = 'Le prénom ne peut pas dépasser 50 caractères';
        }

        // Validation du nom
        if (formData.lastName && formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
        }
        if (formData.lastName && formData.lastName.length > 50) {
            newErrors.lastName = 'Le nom ne peut pas dépasser 50 caractères';
        }

        // Validation du téléphone (format international optionnel)
        if (formData.phone) {
            const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
            if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
                newErrors.phone = 'Format de téléphone invalide';
            }
        }

        // Validation de la bio
        if (formData.bio && formData.bio.length > 300) {
            newErrors.bio = 'La bio ne peut pas dépasser 300 caractères';
        }

        // Validation du genre
        if (formData.gender && !['male', 'female'].includes(formData.gender.toLowerCase())) {
            newErrors.gender = 'Veuillez sélectionner un genre valide';
        }

        // Validation de la date de naissance
        if (formData.birthDate) {
            const birthDate = new Date(formData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();

            if (birthDate > today) {
                newErrors.birthDate = 'La date de naissance ne peut pas être dans le futur';
            } else if (age > 120) {
                newErrors.birthDate = 'Veuillez entrer une date de naissance valide';
            } else if (age < 13) {
                newErrors.birthDate = 'Vous devez avoir au moins 13 ans';
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
                setSuccessMessage('Profil mis à jour avec succès !');
                closeModal();
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrorMessage('Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
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
    const handlePhoneChange = (phoneNumber: string) => {
        handleInputChange('phone', phoneNumber);
    };
    const getFirstName = () => {
        return auth.userProfile?.firstName || auth.user?.username.split(' ')[0] || 'Not set';
    };

    const getLastName = () => {
        return auth.userProfile?.lastName || auth.user?.username.split(' ').slice(1).join(' ') || 'Not set';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">Personal Information</h4>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div>
                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">First Name</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{getFirstName()}</p>
                        </div>
                        <div>
                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Last Name</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{getLastName()}</p>
                        </div>
                        <div>
                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Email address</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{auth.user?.email}</p>
                        </div>
                        <div>
                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {auth.userProfile?.phone || 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Gender</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {auth.userProfile?.gender || 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Birth Date</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {formatDate(auth.userProfile?.birthDate || '')}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Bio</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {auth.userProfile?.bio || auth.user?.role || 'Not set'}
                            </p>
                        </div>
                    </div>
                </div>
                <button onClick={openModal} className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                    <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" > <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" /> </svg>
                    Edit
                </button>
            </div>

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Personal Information
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update your details to keep your profile up-to-date.
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
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Personal Information
                                </h5>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>First Name</Label>
                                        <Input
                                            type="text"
                                            value={formData.firstName || ''}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="e.g. John"
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Last Name</Label>
                                        <Input
                                            type="text"
                                            value={formData.lastName || ''}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="e.g. Doe"
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Email Address</Label>
                                        <Input
                                            type="text"
                                            value={auth.user?.email || ''}
                                            disabled
                                            className="opacity-70"
                                        />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Phone</Label>
                                        <PhoneInput
                                            countries={COUNTRY_CODES}
                                            placeholder="+216 (20) 123-456"
                                            onChange={handlePhoneChange}
                                            selectPosition="start"
                                            value={formData.phone || ''}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Gender</Label>
                                        <select
                                            value={formData.gender || ''}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        {errors.gender && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.gender}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Birth Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.birthDate || ''}
                                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                        />
                                        {errors.birthDate && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.birthDate}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Bio</Label>
                                        <Input
                                            type="text"
                                            value={formData.bio || ''}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            placeholder="Tell us about yourself..."
                                        />
                                        <div className="flex justify-between mt-1">
                                            {errors.bio && (
                                                <p className="text-xs text-red-600 dark:text-red-400">{errors.bio}</p>
                                            )}
                                            <p className={`text-xs ml-auto ${
                                                (formData.bio?.length || 0) > 300
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {formData.bio?.length || 0}/300
                                            </p>
                                        </div>
                                    </div>
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
        </div>
    );
}