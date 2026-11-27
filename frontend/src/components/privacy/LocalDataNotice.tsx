export default function LocalDataNotice() {
  return (
    <section className="local-data-notice" aria-labelledby="local-data-heading">
      <div>
        <p className="section-kicker">Local data</p>
        <h3 id="local-data-heading">Stored only in this browser profile</h3>
      </div>

      <ul className="local-data-list">
        <li>
          Tasks are saved in this browser profile with localStorage under the
          ptma.tasks.v1 key.
        </li>
        <li>
          No backend services, accounts, authentication, analytics, telemetry,
          or cross-device sync are used.
        </li>
        <li>
          Saved tasks remain after refresh, and confirmed deletions remain
          deleted after refresh.
        </li>
        <li>
          Tasks are not available from another browser profile or another
          device.
        </li>
      </ul>
    </section>
  );
}
