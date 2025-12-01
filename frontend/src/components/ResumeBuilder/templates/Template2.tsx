import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import {ResumePdfProps} from "./types.ts"
import React from "react";

Font.register({
    family: "Inter",
    fonts: [
        { src: "https://rsms.me/inter/font-files/Inter-Regular.ttf", fontWeight: 400 },
        { src: "https://rsms.me/inter/font-files/Inter-Bold.ttf", fontWeight: 700 },
    ],
});


const styles = StyleSheet.create({
    page: {
        paddingTop: 28,
        paddingBottom: 28,
        paddingHorizontal: 36,
        fontSize: 11,
        fontFamily: "Inter",
        color: "#111",
        lineHeight: 1.35,
    },
    headerWrap: {
        alignItems: "center",
        paddingBottom: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: "#000",
    },
    name: {
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: 0.4,
        paddingBottom: 6,
    },
    contact: {
        fontSize: 11,
        marginTop: 6,
        color: "#333",
    },
    section: { marginTop: 14 },
    title: {
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        color: "#000",
    },
    rule: {
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        marginTop: 2,
        marginBottom: 6,
    },
    text: { fontSize: 11 },
    bullet: { marginLeft: 6 },
});

const Section: React.FC<{title:string ; children: React.ReactNode}> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rule} />
        {children}
    </View>
);

const Template2: React.FC<ResumePdfProps> = ({
                                   about,
                                   educationList,
                                   workList,
                                   skills,
                                   softSkills,
                                   interests,
                                   projects,
                                   languages,
                                   certificates,
                                   socialActivities,
                               }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* HEADER */}
            <View style={styles.headerWrap}>
                <Text style={styles.name}>{about.name || "Your Name"}</Text>
                <Text style={styles.contact}>
                    {(about.phone || "+000 000 000")}  |  {about.email || "example@mail.com"}
                    {about.linkedin ? `  |  ${about.linkedin}` : ""}
                </Text>
            </View>

            {/* SUMMARY */}
            {about.summary && (
                <Section title="Summary">
                    <Text style={styles.text}>{about.summary}</Text>
                </Section>
            )}

            {/* EXPERIENCE */}
            {workList?.length > 0 && (
                <Section title="Relevant Projects / Work Experience">
                    {workList.map(w => (
                        <View key={w.id} style={{ marginBottom: 8 }}>
                            <Text style={{ ...styles.text, fontWeight: 700 }}>
                                {w.position} — {w.company}
                            </Text>
                            <Text style={{ ...styles.text, color: "#555" }}>
                                {w.startDate} - {w.endDate || "Present"} • {w.type}
                            </Text>
                            {w.description && <Text style={styles.text}>• {w.description}</Text>}
                        </View>
                    ))}
                </Section>
            )}

            {/* PROJECTS */}
            {projects?.length > 0 && (
                <Section title="Projects">
                    {projects.map(p => (
                        <View key={p.id} style={{ marginBottom: 8 }}>
                            <Text style={{ ...styles.text, fontWeight: 700 }}>{p.name}</Text>
                            {p.description && <Text style={styles.text}>• {p.description}</Text>}
                            {(p.url || p.github) && (
                                <Text style={{ ...styles.text, color: "#000" }}>
                                    {p.url || ""} {p.github ? `• ${p.github}` : ""}
                                </Text>
                            )}
                        </View>
                    ))}
                </Section>
            )}

            {/* EDUCATION */}
            {educationList?.length > 0 && (
                <Section title="Education">
                    {educationList.map(e => (
                        <View key={e.id} style={{ marginBottom: 6 }}>
                            <Text style={{ ...styles.text, fontWeight: 700 }}>
                                {e.degree} — {e.school}
                            </Text>
                            <Text style={{ ...styles.text, color: "#555" }}>
                                {e.startYr} - {e.endYr} {e.grade ? `• ${e.grade}` : ""}
                            </Text>
                        </View>
                    ))}
                </Section>
            )}

            {/* SKILLS */}
            {(skills?.length || softSkills?.length || interests?.length) > 0 && (
                <Section title="Skills & Interests">
                    <View>
                        {skills?.map((s, i) => (
                            <Text key={s.id || i} style={styles.text}>• {s.name}</Text>
                        ))}
                        {softSkills?.map((s, i) => (
                            <Text key={s.id || `soft-${i}`} style={styles.text}>• {s.name}</Text>
                        ))}
                        {interests?.map((s, i) => (
                            <Text key={s.id || `int-${i}`} style={styles.text}>• {s.name}</Text>
                        ))}
                    </View>
                </Section>
            )}

            {/* LANGUAGES */}
            {languages?.length > 0 && (
                <Section title="Languages">
                    <Text style={styles.text}>
                        {languages.map(l => `${l.name} (${l.level})`).join(", ")}
                    </Text>
                </Section>
            )}

            {/* CERTIFICATIONS */}
            {certificates?.length > 0 && (
                <Section title="Certifications">
                    {certificates.map(c => (
                        <Text key={c.id} style={styles.text}>
                            {c.title} — {c.issuer} {c.year ? `(${c.year})` : ""}
                        </Text>
                    ))}
                </Section>
            )}

            {/* SOCIAL */}
            {socialActivities?.length > 0 && (
                <Section title="Activities & Leadership">
                    {socialActivities.map(sa => (
                        <View key={sa.id} style={{ marginBottom: 4 }}>
                            <Text style={{ ...styles.text, fontWeight: 700 }}>
                                {sa.role} — {sa.organization}
                            </Text>
                            {sa.description && <Text style={styles.text}>{sa.description}</Text>}
                        </View>
                    ))}
                </Section>
            )}

            {/* FOOTER PAGE NUMBER */}
            <Text
                style={{
                    position: "absolute",
                    bottom: 16,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: 10,
                }}
                render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                fixed
            />
        </Page>
    </Document>
);

export default Template2;