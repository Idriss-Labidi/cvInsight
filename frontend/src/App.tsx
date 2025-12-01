import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AccountSettings from "./pages/AccountSettingsPage/AccountSettings.tsx";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import LoginSuccessful from "./pages/AuthPages/LoginSuccessful.tsx";
import Landing from "./pages/Landing.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import AuthGuard from "./components/auth/AuthGuard.tsx";
import CvExtractionPage from "./pages/CVExtractionpage/CvExtractionPage.tsx";
import CvAnalysis from "./pages/CVAnalysis/CvAnalysis.tsx";
import CareerRecommendations from "./pages/RecommandationPage/CareerRecommendations.tsx";
import ResumeBuilder from "./pages/CVBuilder/ResumeBuilder.tsx";
import PublicRoute from "./components/auth/PublicRoute.tsx";

export default function App() {
    return (
        <>
            <Router>
                <ScrollToTop />
                <AuthProvider>
                    <Routes>
                        {/* Public routes that redirect to home if authenticated */}
                        <Route path="/" element={
                            <PublicRoute>
                                <Landing />
                            </PublicRoute>
                        } />
                        <Route path="/signin" element={
                            <PublicRoute>
                                <SignIn />
                            </PublicRoute>
                        } />
                        <Route path="/signup" element={
                            <PublicRoute>
                                <SignUp />
                            </PublicRoute>
                        } />
                        <Route path="/login/success" element={

                                <LoginSuccessful />

                        } />

                        {/* Dashboard Layout */}
                        <Route element={<AppLayout />}>
                            <Route element={<AuthGuard />}>
                                <Route path="/home" element={<Home />} />

                                {/* Others Page */}
                                <Route path="/profile" element={<UserProfiles />} />
                                <Route path="/account-settings" element={<AccountSettings />} />
                                <Route path="/blank" element={<Blank />} />

                                <Route path="/CvExtractionPage" element={<CvExtractionPage />}/>
                                <Route path="/CvAnalysis" element={<CvAnalysis />}/>
                                <Route path="/Recommendation" element={<CareerRecommendations/>}/>
                                <Route path="/resume-builder" element={<ResumeBuilder />} />
                            </Route>
                        </Route>

                        {/* Fallback Route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </>
    );
}