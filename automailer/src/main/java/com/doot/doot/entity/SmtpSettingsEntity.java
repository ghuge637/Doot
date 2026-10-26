package com.doot.doot.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "smtp_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmtpSettingsEntity {

    @Id
    @Builder.Default
    private Long id = 1L;

    private String host;
    private int port;
    private String username;
    private String password;
    private String fromName;

    public static SmtpSettingsEntityBuilder builder() {
        return new SmtpSettingsEntityBuilder();
    }

    public static class SmtpSettingsEntityBuilder {
        private Long id = 1L;
        private String host;
        private int port;
        private String username;
        private String password;
        private String fromName;

        public SmtpSettingsEntityBuilder id(Long id) { this.id = id; return this; }
        public SmtpSettingsEntityBuilder host(String host) { this.host = host; return this; }
        public SmtpSettingsEntityBuilder port(int port) { this.port = port; return this; }
        public SmtpSettingsEntityBuilder username(String username) { this.username = username; return this; }
        public SmtpSettingsEntityBuilder password(String password) { this.password = password; return this; }
        public SmtpSettingsEntityBuilder fromName(String fromName) { this.fromName = fromName; return this; }

        public SmtpSettingsEntity build() {
            SmtpSettingsEntity entity = new SmtpSettingsEntity();
            entity.setId(id != null ? id : 1L);
            entity.setHost(host);
            entity.setPort(port);
            entity.setUsername(username);
            entity.setPassword(password);
            entity.setFromName(fromName);
            return entity;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }
    public int getPort() { return port; }
    public void setPort(int port) { this.port = port; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }
}