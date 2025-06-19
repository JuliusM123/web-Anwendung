# Lokale HTTPS-Entwicklungsumgebung einrichten

Diese Anleitung beschreibt, wie die lokale Angular-Entwicklungsumgebung auf HTTPS umgestellt wird. Dies ist notwendig, um eine konsistente Umgebung mit dem HTTPS-Backend zu gewährleisten, "Mixed Content"-Warnungen im Browser zu vermeiden und moderne Web-APIs zu nutzen, die einen sicheren Kontext (`Secure Context`) erfordern.

Wir verwenden das Tool `mkcert`, da es auf einfache Weise lokal vertrauenswürdige SSL-Zertifikate erstellt und so die üblichen Browser-Warnungen verhindert.

Bitte befolgen sie diese Schritte einmalig auf deinem Entwicklungsrechner.

## Schritt 1: `mkcert` installieren

`mkcert` ist ein Kommandozeilen-Tool, das am besten über einen Paketmanager installiert wird. Wählen sie die passende Anleitung für dein Betriebssystem.

### macOS (mit Homebrew)

Wenn du Homebrew nicht hast, installieren sie zuerst von [brew.sh](https://brew.sh).

```bash
brew install mkcert
```

### Windows (mit Winget oder Chocolatey)

Sie können einen der beiden gängigen Paketmanager für Windows verwenden. Winget ist in modernen Windows-Versionen oft bereits enthalten.

**Mit Winget (empfohlen):**

```powershell
winget install mkcert
```

**Mit Chocolatey:**

```powershell
choco install mkcert
```

### Linux

Die Installation hängt von deiner Distribution ab. Hier sind Beispiele für gängige Systeme.

**Debian / Ubuntu / etc. (mit APT):**

```bash
sudo apt install libnss3-tools
brew install mkcert # Falls Homebrew auf Linux installiert ist, oder manuell von GitHub
```

**Fedora / CentOS / RHEL (mit DNF/YUM):**

```bash
sudo dnf install nss-tools
brew install mkcert # Falls Homebrew auf Linux installiert ist, oder manuell von GitHub
```

Für andere Distributionen, folgen sie bitte der offiziellen [mkcert Installationsanleitung](https://github.com/FiloSottile/mkcert#installation).

## Schritt 2: Lokale Certificate Authority (CA) einrichten

Dieser Schritt installiert eine lokale CA im Vertrauensspeicher ihres Systems und von ihrem Browser. Er muss nur **einmal pro Computer** ausgeführt werden.

Öffne sie ein Terminal (unter Windows am besten als Administrator) und führen sie es aus:

```bash
mkcert -install
```

Sie sollten eine Erfolgsmeldung erhalten, dass die CA installiert wurde.

## Schritt 3: Zertifikat für `localhost` generieren

Navigieren sie im Terminal in das **Hauptverzeichnis dieses Projekts** und führen sie folgenden Befehl aus:

```bash
mkcert localhost
```

Dieser Befehl erstellt zwei Dateien direkt in deinem Projektordner:

* `localhost.pem` – Das SSL-Zertifikat
* `localhost-key.pem` – Der private SSL-Schlüssel

## Abschließender Schritt: Server starten

Nachdem alle Schritte ausgeführt wurden, starten sie den Angular-Entwicklungsserver neu:

```bash
ng serve
```

Der Server sollte nun unter `https://localhost:4200` erreichbar sein, ohne dass der Browser eine Sicherheitswarnung anzeigt. Die Einrichtung ist abgeschlossen.
