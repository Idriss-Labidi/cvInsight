import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { ResumePdfProps } from "./types";

Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
  page: { paddingTop: 24, paddingBottom: 24, paddingHorizontal: 28, fontSize: 11, color: "#111827" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  name: { fontSize: 20, fontWeight: 700 },
  role: { fontSize: 12, color: "#3b7f4a", fontFamily: "Oswald" },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#3b7f4a" },
  text: { fontSize: 11, lineHeight: 1.4 },
});

const Template3: React.FC<ResumePdfProps> = ({
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
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{about.name || "Your Name"}</Text>
          <Text style={styles.role}>{about.role || "Your Role"}</Text>
          <Text style={styles.text}>{about.email || "email@example.com"} • {about.phone || "+123456789"}</Text>
          <Text style={styles.text}>{about.address || "City, Country"}</Text>
        </View>
        {about.picture ? <Image style={styles.avatar} src={about.picture} /> : null}
      </View>

      {about.summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.text}>{about.summary}</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      {workList?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {workList.map((w) => (
            <View key={w.id} style={{ marginBottom: 6 }}>
              <Text style={styles.text}>{w.position || "Position"} — {w.company || "Company"}</Text>
              <Text style={{ ...styles.text, color: "#6b7280" }}>{w.startDate || "Start"} - {w.endDate || "Present"} • {w.type || ""}</Text>
              {w.description ? <Text style={styles.text}>{w.description}</Text> : null}
            </View>
          ))}
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      {educationList?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {educationList.map((e) => (
            <View key={e.id} style={{ marginBottom: 6 }}>
              <Text style={styles.text}>{e.degree || "Degree"} — {e.school || "School"}</Text>
              <Text style={{ ...styles.text, color: "#6b7280" }}>{e.startYr || ""} - {e.endYr || ""} {e.grade ? `• ${e.grade}` : ""}</Text>
            </View>
          ))}
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      {projects?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {projects.map((p) => (
            <View key={p.id} style={{ marginBottom: 6 }}>
              <Text style={{ ...styles.text, fontWeight: 700 }}>{p.name || 'Project'}</Text>
              {p.description ? <Text style={styles.text}>{p.description}</Text> : null}
              {(p.url || p.github) ? (
                <Text style={{ ...styles.text, color: "#3b7f4a" }}>{p.url || ""} {p.github ? `• ${p.github}` : ""}</Text>
              ) : null}
            </View>
          ))}
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      {(skills?.length || softSkills?.length || interests?.length) ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[...(skills || []), ...(softSkills || []), ...(interests || [])].map((s, idx) => (
              <View key={idx} style={{ backgroundColor: '#d9eadf', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10, marginRight: 4, marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: '#111827' }}>{s.name}</Text>
              </View>
            ))}
          </View>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      {languages?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.text}>{languages.map(l => `${l.name} (${l.level})`).join(", ")}</Text>
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      {certificates?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {certificates.map(c => (
            <Text key={c.id} style={styles.text}>{c.title} — {c.issuer} {c.year ? `(${c.year})` : ""}</Text>
          ))}
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      {socialActivities?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Activities</Text>
          {socialActivities.map(sa => (
            <View key={sa.id} style={{ marginBottom: 4 }}>
              <Text style={styles.text}>{sa.role} — {sa.organization}</Text>
              {sa.description ? <Text style={styles.text}>{sa.description}</Text> : null}
            </View>
          ))}
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', borderStyle: 'dashed', marginTop: 6 }} />
        </View>
      ) : null}

      <Text style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", color: "#6b7280", fontSize: 10 }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
  </Document>
);

export default Template3;
