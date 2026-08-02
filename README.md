# Le Cahier — Gestion scolaire

Application web de gestion scolaire (élèves, classes, bulletins, comptabilité, finance).

## Étape 1 — Créer la base de données (Supabase, gratuit)

1. Allez sur [supabase.com](https://supabase.com), créez un compte, puis un nouveau projet.
2. Une fois le projet créé, allez dans **SQL Editor** (menu de gauche) → **New query**.
3. Copiez tout le contenu du fichier `supabase-schema.sql` (fourni dans ce dossier), collez-le, puis cliquez sur **Run**.
4. Allez dans **Authentication → Users** → **Add user**, et créez le compte du gestionnaire (email + mot de passe). C'est ce compte qui servira à se connecter à l'application.
5. Allez dans **Project Settings → API**. Notez les deux valeurs :
   - **Project URL**
   - **anon public key**

## Étape 2 — Configurer le projet

1. Installez [Node.js](https://nodejs.org) si ce n'est pas déjà fait (version 18 ou plus).
2. Dans ce dossier, dupliquez le fichier `.env.example` en `.env`, et remplissez-le avec les deux valeurs récupérées à l'étape 1 :
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
   ```
3. Ouvrez un terminal dans ce dossier, puis lancez :
   ```
   npm install
   npm run dev
   ```
4. Ouvrez l'adresse affichée (généralement `http://localhost:5173`) et connectez-vous avec le compte créé à l'étape 1.4.

À ce stade, l'application tourne déjà en local avec des données réellement sauvegardées (base Supabase).

## Étape 3 — Mettre en ligne (Vercel, gratuit)

1. Créez un compte sur [github.com](https://github.com) si besoin, puis créez un nouveau dépôt (repository) vide.
2. Dans le terminal, à la racine de ce dossier :
   ```
   git init
   git add .
   git commit -m "Premier envoi"
   git branch -M main
   git remote add origin <URL_DE_VOTRE_DEPOT_GITHUB>
   git push -u origin main
   ```
3. Allez sur [vercel.com](https://vercel.com), connectez-vous avec votre compte GitHub, cliquez sur **New Project**, puis sélectionnez votre dépôt.
4. Dans les paramètres du projet Vercel, section **Environment Variables**, ajoutez les deux mêmes variables que dans `.env` :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Cliquez sur **Deploy**. Après une minute, vous obtenez une adresse du type `le-cahier-gestion.vercel.app`, accessible depuis n'importe quel navigateur (ordinateur ou mobile).

## Mots de passe

- **Connexion principale** : gérée par Supabase (Authentication → Users). Vous pouvez y ajouter d'autres comptes gestionnaires, réinitialiser un mot de passe oublié, etc.
- **Mot de passe Comptabilité** : `compta2026` par défaut. Modifiable une fois connecté, dans **Comptabilité → Paramètres**. Ne le communiquez qu'au comptable.

## Ce qui a changé par rapport au prototype

- Les données (élèves, classes, notes, paiements…) sont désormais sauvegardées en base et non plus perdues à la fermeture de la page.
- La connexion principale utilise une vraie authentification sécurisée (Supabase), au lieu d'un mot de passe unique en clair.
- La devise et la configuration du bulletin restent modifiables comme dans le prototype, et sont maintenant sauvegardées elles aussi.

## Aller plus loin (facultatif)

- Ajouter d'autres comptes gestionnaires (Authentication → Users côté Supabase).
- Donner un compte de connexion dédié et des droits distincts au comptable (actuellement, il partage la même connexion principale mais a son propre mot de passe pour déverrouiller le menu Comptabilité).
- Acheter un nom de domaine personnalisé et le relier à Vercel.
- Passer sur React Native ou Capacitor si une application installable (Play Store / App Store) est souhaitée plus tard.
