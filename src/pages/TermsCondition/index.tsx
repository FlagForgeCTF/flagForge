import { Link } from "react-router-dom";

export default function TermsCondition() {
  return (
    <>
      <div className="max-w-screen-lg mx-auto w-full py-10 flex flex-col gap-8">
        <h1 className="text-center text-2xl font-bold tracking-tight">
          Terms and Conditions for Flag Forge CTF
        </h1>
        <p>
          Welcome to Flag Forge CTF! These Terms and Conditions govern your
          participation and use of the Flag Forge platform. By registering for
          or using Flag Forge CTF, you acknowledge that you have read,
          understood, and agreed to these Terms. If you do not agree with any
          part of these Terms, you must not use the platform.
        </p>
        <ul className="flex flex-col gap-4">
          <li>
            <p className="font-bold">1. Eligibility:</p>
            <p>
              Participation in Flag Forge CTF is open to individuals worldwide,
              subject to any applicable legal restrictions in their respective
              jurisdictions. Participants must meet the minimum legal age
              requirement as determined by the laws of their country or region.
              If you are under the required legal age, you must obtain consent
              from a parent or legal guardian before participating. By
              registering for an account, you confirm that you meet the
              eligibility criteria.
            </p>
          </li>
          <li>
            <p className="font-bold">2. Registration and Accounts:</p>
            <p>
              To access Flag Forge CTF, users must create an account by
              providing accurate and complete information during registration.
              Users are responsible for maintaining the confidentiality of their
              account credentials and must not share their login information
              with others. Each individual is allowed only one account, and
              creating multiple accounts to gain an unfair advantage is strictly
              prohibited. <br />
              <br /> Flag Forge CTF reserves the right to review, suspend, or
              terminate any account found to be in violation of these Terms.
              Users must promptly notify Flag Forge CTF if they suspect any
              unauthorized use of their account. The platform is not responsible
              for any damages or losses resulting from unauthorized access due
              to the user’s failure to maintain account security.
            </p>
          </li>
          <li>
            <p className="font-bold">3. Competition Rules:</p>
            <p>
              Participants are expected to adhere to ethical hacking principles
              when engaging in CTF challenges. Any form of cheating, including
              but not limited to sharing solutions, brute-forcing flags, using
              automated scripts, or attempting to disrupt the platform’s
              infrastructure, is strictly prohibited. <br />
              <br />
              Users must not attempt to gain unauthorized access to the system,
              interfere with other participants’ activities, or exploit
              vulnerabilities outside the scope of the competition. Any
              suspected violations of competition rules may result in immediate
              disqualification, suspension of the user’s account, and potential
              legal action. <br />
              <br />
              All decisions made by Flag Forge CTF regarding competition
              integrity and rule enforcement are final. We encourage fair play
              and a positive learning environment for all participants.
            </p>
          </li>
          <li>
            <p className="font-bold">4. Code of Conduct:</p>
            <p>
              Users are expected to engage respectfully with other participants,
              organizers, and administrators. Harassment, discrimination, hate
              speech, or any form of abusive behavior will not be tolerated.
              This includes inappropriate language, personal attacks, threats,
              or offensive conduct in any form, including on public forums, chat
              rooms, and direct messages within the platform. <br />
              <br />
              Users must not post, share, or distribute content that is illegal,
              harmful, or offensive. Any violations of this Code of Conduct may
              result in immediate suspension or termination of the user’s
              account at the discretion of Flag Forge CTF administrators.
            </p>
          </li>
          <li>
            <p className="font-bold">5. Privacy and Data Use:</p>
            <p>
              Flag Forge CTF collects and processes user data in accordance with
              its Privacy Statement. By using the platform, users consent to the
              collection and use of their personal data for competition
              administration, platform security, and performance analysis.{" "}
              <br />
              <br />
              Certain competition-related information, such as usernames,
              scores, and rankings, may be publicly displayed on leaderboards.
              However, personal information will not be shared with third
              parties without user consent, except where required by law. <br />
              <br />
              Users are strictly prohibited from collecting, storing, or
              distributing other users’ personal data without explicit
              permission. Any misuse of personal data may result in account
              suspension and legal consequences.
            </p>
          </li>
          <li>
            <p className="font-bold">6. Intellectual Property:</p>
            <p>
              All content provided within Flag Forge CTF, including challenges,
              platform design, and branding, is the intellectual property of
              Flag Forge CTF or its licensors. Users are not permitted to copy,
              distribute, modify, or reproduce any platform content without
              explicit authorization from the administrators. <br />
              <br />
              Users retain intellectual property rights to their own challenge
              submissions and solutions. However, Flag Forge CTF reserves the
              right to use anonymized challenge results for educational,
              analytical, and promotional purposes.
            </p>
          </li>
          <li>
            <p className="font-bold">
              7. Disclaimers and Limitation of Liability:
            </p>
            <p>
              Flag Forge CTF is provided on an "as is" and "as available" basis,
              without any warranties of availability, security, or accuracy.
              While we strive to ensure a stable and secure platform, we do not
              guarantee that the platform will always function without errors,
              delays, or security vulnerabilities. <br />
              <br />
              Flag Forge CTF is designed for educational and ethical hacking
              purposes only. We are not responsible for any damages, losses, or
              liabilities resulting from participation in the competition,
              reliance on platform content, or technical issues encountered
              during use. Users assume all risks associated with their
              participation.
            </p>
          </li>
          <li>
            <p className="font-bold">8. Changes to These Terms:</p>
            <p>
              Flag Forge CTF reserves the right to update or modify these Terms
              at any time. If significant changes are made, we will notify users
              via email or an announcement on the platform. It is the user’s
              responsibility to review the Terms periodically for updates.{" "}
              <br />
              <br />
              Continued use of the platform after any modifications constitutes
              acceptance of the revised Terms. If a user disagrees with any
              changes, they must discontinue their participation in Flag Forge
              CTF.
            </p>
          </li>
          <li>
            <p className="font-bold">9. Termination and Enforcement:</p>
            <p>
              Flag Forge CTF reserves the right to suspend or terminate user
              accounts at its discretion if a user violates these Terms or
              engages in behavior that compromises the integrity of the
              platform. Depending on the severity of the violation, Flag Forge
              CTF may also pursue legal action against offenders. <br />
              <br />
              Users may request account deletion at any time by contacting the
              Flag Forge CTF team. However, historical participation data, such
              as leaderboard rankings, may be retained for analytical and
              reporting purposes.
            </p>
          </li>
          <li>
            <p className="font-bold">10. Contact Information:</p>
            <p>
              If you have any questions, concerns, or requests regarding these
              Terms and Conditions, please contact us: <br />
              <br />
              <span className="font-bold">Flag Forge CTF Team</span> <br />
              <br />
              Email:
              <Link
                to="mailto:info@flagforge.xyz"
                className="underline text-blue-800"
              >
                info@flagforge.xyz
              </Link>
              <br /> Website:{" "}
              <Link to="www.flagforge.xyz" className="underline text-blue-800">
                www.flagforge.xyz
              </Link>
              <br />
              <br />
              You agree to comply with these Terms and Conditions by registering
              for and using Flag Forge CTF. Failure to adhere to these Terms may
              result in consequences, including disqualification, account
              suspension, or legal action. Thank you for participating, and we
              hope you enjoy the challenge! <br />
              <br /> Effective Date: 7 February 2025 <br /> Last Updated: 6
              February 2025
            </p>
          </li>
        </ul>
      </div>
    </>
  );
}
