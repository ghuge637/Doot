package com.doot.doot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmtpConfig {
    @Builder.Default
    private String host = "smtp.gmail.com";
    
    @Builder.Default
    private int port = 587;
    
    private String username;
    private String password; // App password
    private String fromName;
    
    @Builder.Default
    private boolean auth = true;
    
    @Builder.Default
    private boolean starttls = true;

    public static SmtpConfigBuilder builder() {
        return new SmtpConfigBuilder();
    }

    public static class SmtpConfigBuilder {
        private String host = "smtp.gmail.com";
        private int port = 587;
        private String username;
        private String password;
        private String fromName;
        private boolean auth = true;
        private boolean starttls = true;

        public SmtpConfigBuilder host(String host) { this.host = host; return this; }
        public SmtpConfigBuilder port(int port) { this.port = port; return this; }
        public SmtpConfigBuilder username(String username) { this.username = username; return this; }
        public SmtpConfigBuilder password(String password) { this.password = password; return this; }
        public SmtpConfigBuilder fromName(String fromName) { this.fromName = fromName; return this; }
        public SmtpConfigBuilder auth(boolean auth) { this.auth = auth; return this; }
        public SmtpConfigBuilder starttls(boolean starttls) { this.starttls = starttls; return this; }

        public SmtpConfig build() {
            SmtpConfig c = new SmtpConfig();
            c.setHost(host);
            c.setPort(port);
            c.setUsername(username);
            c.setPassword(password);
            c.setFromName(fromName);
            c.setAuth(auth);
            c.setStarttls(starttls);
            return c;
        }
    }

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
    public boolean isAuth() { return auth; }
    public void setAuth(boolean auth) { this.auth = auth; }
    public boolean isStarttls() { return starttls; }
    public void setStarttls(boolean starttls) { this.starttls = starttls; }
}