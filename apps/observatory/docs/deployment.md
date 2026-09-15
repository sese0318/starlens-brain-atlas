# Edit and publish the website

The website has three pages: `index.html` explains the project, `impact.html` covers impact and the treatment opportunity, and `hackathon.html` describes the next steps. Shared styling is in `site.css`. The interactive application is separate.

## Make a change in your browser

After accepting your GitHub collaborator invitation:

1. Open the DopaTeam repository on GitHub and select the page you want to edit.
2. Click the pencil icon to edit. Find the sentence or section you want to change.
3. Select **Commit changes** and describe the change in one sentence.
4. Commit to `main` to publish directly. Once the Vercel connection is active, this starts a new production deployment. The public site updates when that deployment succeeds.

For larger changes, create a branch and open a pull request. Review the change together, then merge it into `main` to publish. Preview deployments may require the project owner's authorization or a preview access link.

Everyone edits the same source. Refresh before starting and check for recent changes from teammates. If an edit causes a problem, revert the commit on GitHub to trigger a deployment of the restored version.

## How publishing works

The intended connection is the public `Rifelimo/DopaTeam` GitHub repository to the `dopateam` Vercel project. The production branch is `main`. GitHub collaborators can edit the code and trigger publication through this connection. They do not need the owner's Vercel password.

Vercel serves the website. It is not the editor used in these steps. Opening the public page lets a visitor use it; changing it requires access to the GitHub source.

The build command copies `index.html`, `impact.html`, `hackathon.html` and `site.css` into `dist/`. Vercel serves only the `dist` directory. The site needs no dependencies, database or environment variables. Repository documentation is not part of the served website. The `.vercelignore` file also limits deployment source files to these four website files and `vercel.json`.

For an optional CLI deployment, first link the local directory to the existing project in the intended account. Then inspect the upload:

```sh
vercel deploy --dry --format=json --scope krakras-projects
```

The expected source upload consists of `index.html`, `impact.html`, `hackathon.html`, `site.css` and `vercel.json`. After review, an authorized production deployment can use:

```sh
vercel deploy --prod --project dopateam --scope krakras-projects
```

## Verify publication and integration

The three page website is public at https://dopateam.vercel.app. Publishing this repository does not establish a GitHub deployment connection or give teammates editing access. Those steps remain separate.

After setup, record the returned production URL. Open it without a Vercel login and check all three pages, their navigation and mobile layout. Confirm the production deployment uses the intended commit. Confirm each collaborator accepts their invitation before reporting that they have editing access.

## Account access

GitHub collaboration is sufficient for the editing workflow above. Separate Vercel dashboard permissions are needed only for people who will manage hosting settings directly. A Vercel Viewer role cannot configure or deploy the project; other roles depend on the account plan.

References: [Vercel Git deployments](https://vercel.com/docs/git), [public repository collaboration](https://vercel.com/docs/deployments/troubleshoot-project-collaboration), and [GitHub collaborator invitations](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository).
