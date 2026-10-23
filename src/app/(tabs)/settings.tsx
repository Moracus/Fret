import { Card, Copy, Page, Title } from "@/practice/ui";
export default function Settings() {
  return (
    <Page title="Settings">
      <Card>
        <Title>Local and private</Title>
        <Copy>
          Your journal is saved on this device. No account or connection is
          needed to log practice.
        </Copy>
      </Card>
      <Title>Dates and weeks</Title>
      <Copy>
        Sessions belong to the calendar date you enter. Today follows your
        device’s local timezone. Weeks run Monday through Sunday.
      </Copy>
    </Page>
  );
}
