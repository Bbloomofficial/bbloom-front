import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { describeProblem } from "../../api/problem";
import { useI18n } from "../../i18n";
import {
  fetchMembers,
  inviteMember,
  removeMember,
  setMemberRole,
} from "../api/account";
import type { MemberRole, SiteMember } from "../api/types";
import { useSession } from "../auth";
import { RoleBadge } from "../components/Badges";
import { useActiveSite, useIsOwner } from "../site";
import { dashboardStrings, formatDate } from "../strings";

/**
 * Who may edit this website. Owner-only to change, because deciding who can
 * rewrite the business's public face is not itself an editing decision.
 */
export default function Team() {
  const { locale } = useI18n();
  const t = dashboardStrings(locale);
  const { token, user } = useSession();
  const site = useActiveSite();
  const isOwner = useIsOwner();

  const [members, setMembers] = useState<SiteMember[] | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("SITE_EDITOR");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    // The list itself is owner-only; asking as an editor earns a 403 and an
    // English error where an explanation belongs.
    if (!isOwner) return;
    setLoadError(null);
    fetchMembers(token, site.id).then(setMembers).catch(setLoadError);
  }, [token, site.id, isOwner]);

  useEffect(load, [load]);

  function report(caught: unknown, fallback: string) {
    setError(describeProblem(caught, t.errors, fallback));
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy("invite");
    setError(null);
    try {
      // This attaches an account that already exists; there is no invitation
      // for an address nobody has signed up with, because that needs email.
      await inviteMember(token, site.id, email.trim(), role);
      setEmail("");
      load();
    } catch (caught) {
      report(caught, t.team.inviting);
    } finally {
      setBusy(null);
    }
  }

  async function changeRole(member: SiteMember, next: MemberRole) {
    if (busy) return;
    setBusy(member.accountId);
    setError(null);
    try {
      await setMemberRole(token, site.id, member.accountId, next);
      load();
    } catch (caught) {
      report(caught, t.team.role);
    } finally {
      setBusy(null);
    }
  }

  async function remove(member: SiteMember) {
    if (busy) return;
    if (!window.confirm(t.team.removeConfirm)) return;
    setBusy(member.accountId);
    setError(null);
    try {
      await removeMember(token, site.id, member.accountId);
      load();
    } catch (caught) {
      report(caught, t.team.remove);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {t.team.title}
        </h1>
        <p className="mt-1 text-sm text-ink-600">{t.team.subtitle}</p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-tint px-4 py-3 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-3xl border border-ink-100 bg-surface">
        {!isOwner ? (
          <p className="p-5 text-sm text-ink-600">{t.team.ownerOnly}</p>
        ) : loadError ? (
          <div className="p-5">
            <p className="text-sm text-ink-600">{loadError.message}</p>
            <button type="button" onClick={load} className="btn-secondary mt-4">
              {t.retry}
            </button>
          </div>
        ) : !members ? (
          <p className="p-5 text-sm text-ink-400">{t.loading}</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {members.map((member) => {
              const isSelf = member.accountId === user.id;
              return (
                <li
                  key={member.accountId}
                  className="flex flex-wrap items-center gap-3 p-4 sm:p-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900">
                      {member.fullName}
                      {isSelf && (
                        <span className="ms-2 text-xs font-semibold text-ink-400">
                          ({t.team.you})
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-ink-400" dir="ltr">
                      {member.email}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">
                      {t.team.lastLogin}:{" "}
                      {member.lastLoginAt
                        ? formatDate(member.lastLoginAt, locale)
                        : t.team.never}
                      {member.emailVerified === false
                        ? ` · ${t.team.unverified}`
                        : ""}
                    </p>
                  </div>

                  <RoleBadge role={member.role} />

                  {isOwner && !isSelf && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() =>
                          void changeRole(
                            member,
                            member.role === "SITE_OWNER"
                              ? "SITE_EDITOR"
                              : "SITE_OWNER",
                          )
                        }
                        className="rounded-xl border border-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-bloom-300 disabled:opacity-60"
                      >
                        {member.role === "SITE_OWNER"
                          ? t.team.makeEditor
                          : t.team.makeOwner}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void remove(member)}
                        className="rounded-xl border border-ink-100 px-3 py-1.5 text-xs font-semibold text-danger transition hover:border-danger disabled:opacity-60"
                      >
                        {t.team.remove}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {isOwner ? (
        <form
          onSubmit={invite}
          className="rounded-3xl border border-ink-100 bg-surface p-5 sm:p-6"
          noValidate
        >
          <h2 className="text-sm font-bold text-ink-900">
            {t.team.inviteTitle}
          </h2>
          <p className="mt-1 text-xs text-ink-400">{t.team.inviteHint}</p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[16rem] flex-1">
              <label className="label" htmlFor="invite-email">
                {t.team.member}
              </label>
              <input
                id="invite-email"
                type="email"
                required
                dir="ltr"
                className="field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="invite-role">
                {t.team.role}
              </label>
              <select
                id="invite-role"
                className="field"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as MemberRole)
                }
              >
                <option value="SITE_EDITOR">{t.roles.SITE_EDITOR}</option>
                <option value="SITE_OWNER">{t.roles.SITE_OWNER}</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={busy !== null}
              className="btn-primary disabled:opacity-60"
            >
              {busy === "invite" ? t.team.inviting : t.team.invite}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
