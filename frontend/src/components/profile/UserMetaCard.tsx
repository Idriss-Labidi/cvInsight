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

export default function UserMetaCard() {
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
                socialLinks: auth.userProfile.socialLinks || {
                    facebook: '',
                    linkedin: '',
                    twitter: '',
                    github: '',
                    instagram: ''
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

        // Validation des URLs des réseaux sociaux
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

        if (formData.socialLinks?.facebook && !urlRegex.test(formData.socialLinks.facebook)) {
            newErrors.facebook = 'URL Facebook invalide';
        }
        if (formData.socialLinks?.twitter && !urlRegex.test(formData.socialLinks.twitter)) {
            newErrors.twitter = 'URL X.com invalide';
        }
        if (formData.socialLinks?.linkedin && !urlRegex.test(formData.socialLinks.linkedin)) {
            newErrors.linkedin = 'URL LinkedIn invalide';
        }
        if (formData.socialLinks?.instagram && !urlRegex.test(formData.socialLinks.instagram)) {
            newErrors.instagram = 'URL Instagram invalide';
        }
        if (formData.socialLinks?.github && !urlRegex.test(formData.socialLinks.github)) {
            newErrors.github = 'URL GitHub invalide';
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

    const handleSocialLinkChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }));
        // Effacer l'erreur du champ modifié
        if (errors[platform]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[platform];
                return newErrors;
            });
        }
    };

    const handlePhoneChange = (phoneNumber: string) => {
        handleInputChange('phone', phoneNumber);
    };

    const getInitials = () => {
        const firstName = auth.userProfile?.firstName || auth.user?.username.split(' ')[0] || 'U';
        const lastName = auth.userProfile?.lastName || auth.user?.username.split(' ')[1] || '';

        if (!lastName) return firstName[0].toUpperCase();
        return (firstName[0] + lastName[0]).toUpperCase();
    };

    const getDisplayName = () => {
        if (auth.userProfile?.firstName && auth.userProfile?.lastName) {
            return `${auth.userProfile.firstName} ${auth.userProfile.lastName}`;
        }
        return auth.user?.username || 'User';
    };

    const getLocation = () => {
        const city = auth.userProfile?.address?.city;
        const country = auth.userProfile?.address?.country;
        if (city && country) return `${city}, ${country}`;
        if (city) return city;
        if (country) return country;
        return 'Location not set';
    };

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                        <div className="mr-3 flex h-15 w-15 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-2xl">
                            {getInitials()}
                        </div>
                        <div className="order-3 xl:order-2">
                            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                                {getDisplayName()}
                            </h4>
                            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {auth.userProfile?.bio}
                                </p>
                                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {getLocation()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                            <a href={auth.userProfile?.socialLinks?.facebook || ''} target={auth.userProfile?.socialLinks?.facebook ? "_blank" : undefined} rel="noopener" className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z" fill="" />
                                </svg>
                            </a>
                            <a href={auth.userProfile?.socialLinks?.twitter || ''} target={auth.userProfile?.socialLinks?.twitter ? "_blank" : undefined} rel="noopener" className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" fill="" />
                                </svg>
                            </a>
                            <a href={auth.userProfile?.socialLinks?.linkedin || ''} target={auth.userProfile?.socialLinks?.linkedin ? "_blank" : undefined} rel="noopener" className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z" fill="" />
                                </svg>
                            </a>
                            <a href={auth.userProfile?.socialLinks?.instagram || ''} target={auth.userProfile?.socialLinks?.instagram ? "_blank" : undefined} rel="noopener" className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.8567 1.66699C11.7946 1.66854 12.2698 1.67351 12.6805 1.68573L12.8422 1.69102C13.0291 1.69766 13.2134 1.70599 13.4357 1.71641C14.3224 1.75738 14.9273 1.89766 15.4586 2.10391C16.0078 2.31572 16.4717 2.60183 16.9349 3.06503C17.3974 3.52822 17.6836 3.99349 17.8961 4.54141C18.1016 5.07197 18.2419 5.67753 18.2836 6.56433C18.2935 6.78655 18.3015 6.97088 18.3081 7.15775L18.3133 7.31949C18.3255 7.73011 18.3311 8.20543 18.3328 9.1433L18.3335 9.76463C18.3336 9.84055 18.3336 9.91888 18.3336 9.99972L18.3335 10.2348L18.333 10.8562C18.3314 11.794 18.3265 12.2694 18.3142 12.68L18.3089 12.8417C18.3023 13.0286 18.294 13.213 18.2836 13.4351C18.2426 14.322 18.1016 14.9268 17.8961 15.458C17.6842 16.0074 17.3974 16.4713 16.9349 16.9345C16.4717 17.397 16.0057 17.6831 15.4586 17.8955C14.9273 18.1011 14.3224 18.2414 13.4357 18.2831C13.2134 18.293 13.0291 18.3011 12.8422 18.3076L12.6805 18.3128C12.2698 18.3251 11.7946 18.3306 10.8567 18.3324L10.2353 18.333C10.1594 18.333 10.0811 18.333 10.0002 18.333H9.76516L9.14375 18.3325C8.20591 18.331 7.7306 18.326 7.31997 18.3137L7.15824 18.3085C6.97136 18.3018 6.78703 18.2935 6.56481 18.2831C5.67801 18.2421 5.07384 18.1011 4.5419 17.8955C3.99328 17.6838 3.5287 17.397 3.06551 16.9345C2.60231 16.4713 2.3169 16.0053 2.1044 15.458C1.89815 14.9268 1.75856 14.322 1.7169 13.4351C1.707 13.213 1.69892 13.0286 1.69238 12.8417L1.68714 12.68C1.67495 12.2694 1.66939 11.794 1.66759 10.8562L1.66748 9.1433C1.66903 8.20543 1.67399 7.73011 1.68621 7.31949L1.69151 7.15775C1.69815 6.97088 1.70648 6.78655 1.7169 6.56433C1.75786 5.67683 1.89815 5.07266 2.1044 4.54141C2.3162 3.9928 2.60231 3.52822 3.06551 3.06503C3.5287 2.60183 3.99398 2.31641 4.5419 2.10391C5.07315 1.89766 5.67731 1.75808 6.56481 1.71641C6.78703 1.70652 6.97136 1.69844 7.15824 1.6919L7.31997 1.68666C7.7306 1.67446 8.20591 1.6689 9.14375 1.6671L10.8567 1.66699ZM10.0002 5.83308C7.69781 5.83308 5.83356 7.69935 5.83356 9.99972C5.83356 12.3021 7.69984 14.1664 10.0002 14.1664C12.3027 14.1664 14.1669 12.3001 14.1669 9.99972C14.1669 7.69732 12.3006 5.83308 10.0002 5.83308ZM10.0002 7.49974C11.381 7.49974 12.5002 8.61863 12.5002 9.99972C12.5002 11.3805 11.3813 12.4997 10.0002 12.4997C8.6195 12.4997 7.50023 11.3809 7.50023 9.99972C7.50023 8.61897 8.61908 7.49974 10.0002 7.49974ZM14.3752 4.58308C13.8008 4.58308 13.3336 5.04967 13.3336 5.62403C13.3336 6.19841 13.8002 6.66572 14.3752 6.66572C14.9496 6.66572 15.4169 6.19913 15.4169 5.62403C15.4169 5.04967 14.9488 4.58236 14.3752 4.58308Z" fill="" />
                                </svg>
                            </a>
                            <a href={auth.userProfile?.socialLinks?.github || ''} target={auth.userProfile?.socialLinks?.github ? "_blank" : undefined} rel="noopener" className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                                <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 1.25C5.16875 1.25 1.25 5.175 1.25 10C1.25 13.525 3.3625 16.525 6.4125 17.9125C6.875 18 7.025 17.75 7.025 17.5375C7.025 17.3375 7.01875 16.775 7.0125 16.0625C4.625 16.5625 4.125 15.125 4.125 15.125C3.75 14.125 3.175 13.825 3.175 13.825C2.425 13.275 3.275 13.2875 3.275 13.2875C4.15 13.35 4.6375 14.1875 4.6375 14.1875C5.375 15.4875 6.6125 15.125 7.0375 14.9375C7.1125 14.4375 7.3125 14.0875 7.5375 13.8875C5.6 13.6625 3.575 12.925 3.575 9.475C3.575 8.4125 3.95 7.55 4.65625 6.8875C4.55 6.6375 4.2375 5.65 4.7375 4.3375C4.7375 4.3375 5.55 4.0625 7.025 5.125C7.725 4.9375 8.475 4.84375 9.225 4.84375C9.975 4.84375 10.725 4.9375 11.425 5.125C12.9 4.0625 13.7125 4.3375 13.7125 4.3375C14.2125 5.65 13.9 6.6375 13.7937 6.8875C14.5 7.55 14.875 8.4125 14.875 9.475C14.875 12.9375 12.85 13.6625 10.9125 13.8875C11.2 14.1375 11.4625 14.6375 11.4625 15.4125C11.4625 16.5625 11.45 17.475 11.45 17.5375C11.45 17.75 11.6 18 12.0625 17.9125C15.1125 16.525 17.225 13.525 17.225 10C17.225 5.175 13.3062 1.25 8.475 1.25H10Z" fill="" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <button onClick={openModal} className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                        <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" fill="" />
                        </svg>
                        Edit
                    </button>
                </div>
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
                            <div>
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Social Links
                                </h5>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div>
                                        <Label>Facebook</Label>
                                        <Input
                                            type="text"
                                            value={formData.socialLinks?.facebook || ''}
                                            onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                            placeholder="e.g. https://www.facebook.com/yourprofile"
                                        />
                                        {errors.facebook && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.facebook}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>X.com</Label>
                                        <Input
                                            type="text"
                                            value={formData.socialLinks?.twitter || ''}
                                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                            placeholder="e.g. https://x.com/yourprofile"
                                        />
                                        {errors.twitter && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.twitter}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Linkedin</Label>
                                        <Input
                                            type="text"
                                            value={formData.socialLinks?.linkedin || ''}
                                            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                            placeholder="e.g. https://www.linkedin.com/in/yourprofile"
                                        />
                                        {errors.linkedin && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.linkedin}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Instagram</Label>
                                        <Input
                                            type="text"
                                            value={formData.socialLinks?.instagram || ''}
                                            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                            placeholder="e.g. https://instagram.com/yourprofile"
                                        />
                                        {errors.instagram && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.instagram}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>GitHub</Label>
                                        <Input
                                            type="text"
                                            value={formData.socialLinks?.github || ''}
                                            onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                                            placeholder="e.g. https://github.com/yourprofile"
                                        />
                                        {errors.github && (
                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.github}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                                            placeholder="e.g. Jhon"
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
        </>
    );
}