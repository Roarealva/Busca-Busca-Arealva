# Guia Final de Hospedagem - Busca Busca Arealva

### Passo 1: O Banco de Dados
No seu cPanel:
1. Clique em **Bancos de dados MySQL®**.
2. Crie um banco (ex: `arealva_imoveis`).
3. Crie um usuário e senha (anote-os).
4. Adicione o usuário ao banco com **Todos os Privilégios**.
5. Vá em **phpMyAdmin**, clique no seu banco e no botão **Importar**. Selecione o arquivo `database.sql` que está na raiz do projeto.

### Passo 2: Configurando a Conexão
1. No seu computador, abra a pasta `api/` e edite o arquivo `config.php`.
2. Onde está `nome_do_seu_banco`, `usuario_do_banco` e `senha_do_banco`, coloque os dados que você criou no Passo 1.
3. No `SITE_URL`, coloque o seu domínio (ex: `https://buscaarealva.com.br`). **Sem isso o PIX não avisa o site quando for pago!**

### Passo 3: Upload dos Arquivos
1. Use o **Gerenciador de Arquivos** da hospedagem ou um programa de FTP (como FileZilla).
2. Envie todos os arquivos para dentro da pasta `public_html`.
3. Verifique se a pasta `api/` foi junto.

### Passo 4: Mercado Pago
Para o PIX ser gerado de verdade:
1. Vá ao seu painel de desenvolvedor do Mercado Pago.
2. Certifique-se que você tem o **Access Token de Produção** colado no `api/config.php`.
3. Em "Notificações de Webhooks", aponte para `https://SEU-DOMINIO.com.br/api/webhook.php`.

**IMPORTANTE:**
- Para que o site salve os dados "para sempre", você precisará ajustar o `App.tsx` no futuro para fazer `fetch` de login e busca de imóveis na sua API PHP, em vez de usar o `localStorage` (que limpa se o usuário mudar de navegador). Mas para começar a vender e anunciar agora, esta estrutura já é funcional!
