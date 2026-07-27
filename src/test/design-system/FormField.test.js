import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { useForm } from "react-hook-form";

import FormField from "../../design-system/FormField";
import dayjs from "../../design-system/dayjs";

/*
  FormField is a react-hook-form Controller wrapper around the MUI inputs. Each
  `type` branch renders a different control, so the harness below mounts a real
  useForm() and exposes the live values / submit result to the assertions.
*/
const Harness = ({ defaultValues = {}, onValues, ...fieldProps }) => {
  const { control, getValues, trigger, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });
  return (
    <div>
      <FormField control={control} {...fieldProps} />
      <button
        type="button"
        onClick={async () => {
          const ok = await trigger();
          if (onValues) onValues(getValues(), ok);
        }}
      >
        submit
      </button>
      <span data-testid="dirty">{String(formState.isDirty)}</span>
    </div>
  );
};

const submit = () => fireEvent.click(screen.getByRole("button", { name: "submit" }));

describe("FormField — text / textarea / password / number", () => {
  it("renders a text field and pushes keystrokes into the form state", () => {
    const onValues = jest.fn();
    render(
      <Harness
        name="username"
        label="Username"
        placeholder="Username"
        defaultValues={{ username: "" }}
        onValues={onValues}
      />
    );
    const input = screen.getByPlaceholderText("Username");
    expect(input).toHaveAttribute("type", "text");
    fireEvent.change(input, { target: { value: "kiran" } });
    submit();
    return waitFor(() =>
      expect(onValues).toHaveBeenCalledWith({ username: "kiran" }, true)
    );
  });

  it("renders a multiline textarea for type=textarea", () => {
    const { container } = render(
      <Harness
        name="notes"
        label="Notes"
        type="textarea"
        rows={6}
        placeholder="Notes"
        inputProps={{ maxLength: 20 }}
        defaultValues={{ notes: "" }}
      />
    );
    const area = container.querySelector("textarea");
    expect(area).toBeInTheDocument();
    expect(area).toHaveAttribute("maxlength", "20");
  });

  it("defaults textarea rows when none are supplied", () => {
    const { container } = render(
      <Harness name="notes" label="Notes" type="textarea" defaultValues={{ notes: "" }} />
    );
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });

  it("honours multiline without the textarea type", () => {
    const { container } = render(
      <Harness name="notes" label="Notes" multiline rows={3} defaultValues={{ notes: "" }} />
    );
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });

  it("passes password and number types straight through", () => {
    const { unmount } = render(
      <Harness name="pwd" label="Password" type="password" placeholder="Password" />
    );
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute(
      "type",
      "password"
    );
    unmount();

    render(<Harness name="qty" label="Qty" type="number" placeholder="Qty" />);
    expect(screen.getByPlaceholderText("Qty")).toHaveAttribute("type", "number");
  });

  it("renders start and end adornments plus extra InputProps", () => {
    render(
      <Harness
        name="amount"
        label="Amount"
        placeholder="Amount"
        startAdornment={<span>USD</span>}
        endAdornment={<span>.00</span>}
        InputProps={{ "data-testid": "amount-input-root" }}
        defaultValues={{ amount: "" }}
      />
    );
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText(".00")).toBeInTheDocument();
    expect(screen.getByTestId("amount-input-root")).toBeInTheDocument();
  });

  it("coerces a null/undefined field value to an empty string", () => {
    render(
      <Harness name="empty" label="Empty" placeholder="Empty" defaultValues={{ empty: null }} />
    );
    expect(screen.getByPlaceholderText("Empty")).toHaveValue("");
  });

  it("supports the disabled state", () => {
    render(<Harness name="ro" label="Read only" placeholder="Read only" disabled />);
    expect(screen.getByPlaceholderText("Read only")).toBeDisabled();
  });

  it("shows static helper text and replaces it with the validation error", async () => {
    render(
      <Harness
        name="email"
        label="Email"
        placeholder="Email"
        helperText="We never share this"
        required
        defaultValues={{ email: "" }}
      />
    );
    expect(screen.getByText("We never share this")).toBeInTheDocument();
    submit();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.queryByText("We never share this")).not.toBeInTheDocument();
  });

  it("falls back to a generic required message when there is no label", async () => {
    render(<Harness name="thing" placeholder="Thing" required defaultValues={{ thing: "" }} />);
    submit();
    expect(await screen.findByText("This field is required")).toBeInTheDocument();
  });

  it("uses a custom required message string", async () => {
    render(
      <Harness
        name="thing"
        label="Thing"
        placeholder="Thing"
        required="Thing is mandatory !"
        defaultValues={{ thing: "" }}
      />
    );
    submit();
    expect(await screen.findByText("Thing is mandatory !")).toBeInTheDocument();
  });

  it("merges caller supplied rules with the required shortcut", async () => {
    render(
      <Harness
        name="code"
        label="Code"
        placeholder="Code"
        required
        rules={{ pattern: { value: /^[0-9]+$/, message: "Digits only" } }}
        defaultValues={{ code: "" }}
      />
    );
    fireEvent.change(screen.getByPlaceholderText("Code"), {
      target: { value: "abc" },
    });
    expect(await screen.findByText("Digits only")).toBeInTheDocument();
  });

  it("keeps an explicit rules.required over the shortcut", async () => {
    render(
      <Harness
        name="code"
        label="Code"
        placeholder="Code"
        required="shortcut message"
        rules={{ required: "explicit message" }}
        defaultValues={{ code: "" }}
      />
    );
    submit();
    expect(await screen.findByText("explicit message")).toBeInTheDocument();
    expect(screen.queryByText("shortcut message")).not.toBeInTheDocument();
  });

  it("composes a consumer onChange/onBlur without breaking field registration", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    const onValues = jest.fn();
    render(
      <Harness
        name="live"
        label="Live"
        placeholder="Live"
        onChange={onChange}
        onBlur={onBlur}
        onValues={onValues}
        defaultValues={{ live: "" }}
      />
    );
    const input = screen.getByPlaceholderText("Live");
    fireEvent.change(input, { target: { value: "typed" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    // the RHF handler still ran — the value made it into the form state
    expect(input).toHaveValue("typed");
    submit();
    await waitFor(() =>
      expect(onValues).toHaveBeenCalledWith({ live: "typed" }, true)
    );
  });

  it("uses the defaultValue prop when the form has no value for the field", () => {
    render(<Harness name="seeded" label="Seeded" placeholder="Seeded" defaultValue="from prop" />);
    expect(screen.getByPlaceholderText("Seeded")).toHaveValue("from prop");
  });
});

describe("FormField — select", () => {
  const objOptions = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", disabled: true },
  ];

  it("renders object options, selects one and reports it to the form", async () => {
    const onValues = jest.fn();
    render(
      <Harness
        name="status"
        label="Status"
        type="select"
        options={objOptions}
        defaultValues={{ status: "" }}
        onValues={onValues}
      />
    );
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /status/i }));
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByText("Alpha")).toBeInTheDocument();
    // option without a label falls back to its value
    expect(within(listbox).getByText("c")).toBeInTheDocument();
    expect(within(listbox).getByText("c").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    fireEvent.click(within(listbox).getByText("Beta"));
    submit();
    await waitFor(() =>
      expect(onValues).toHaveBeenCalledWith({ status: "b" }, true)
    );
  });

  it("renders plain string options", async () => {
    render(
      <Harness
        name="tier"
        label="Tier"
        type="select"
        options={["Gold", "Silver"]}
        defaultValues={{ tier: "" }}
      />
    );
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /tier/i }));
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByText("Gold")).toBeInTheDocument();
    fireEvent.click(within(listbox).getByText("Silver"));
    await waitFor(() =>
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    );
  });

  it("omits the InputLabel when no label is supplied", () => {
    const { container } = render(
      <Harness name="tier" type="select" options={["Gold"]} defaultValues={{ tier: "" }} />
    );
    expect(container.querySelector("label")).toBeNull();
  });

  it("supports disabled, helper text and the required error", async () => {
    const { unmount } = render(
      <Harness
        name="tier"
        label="Tier"
        type="select"
        options={["Gold"]}
        helperText="Pick a tier"
        disabled
        defaultValues={{ tier: "" }}
      />
    );
    expect(screen.getByText("Pick a tier")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /tier/i })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    unmount();

    render(
      <Harness
        name="tier"
        label="Tier"
        type="select"
        options={["Gold"]}
        required="Tier is mandatory !"
        defaultValues={{ tier: "" }}
      />
    );
    submit();
    expect(await screen.findByText("Tier is mandatory !")).toBeInTheDocument();
  });

  it("coerces a null value to an empty selection and forwards onChange/onBlur", async () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();
    render(
      <Harness
        name="tier"
        label="Tier"
        type="select"
        options={["Gold", "Silver"]}
        onChange={onChange}
        onBlur={onBlur}
        defaultValues={{ tier: null }}
      />
    );
    const combo = screen.getByRole("combobox", { name: /tier/i });
    fireEvent.mouseDown(combo);
    fireEvent.click(await screen.findByText("Gold"));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    fireEvent.blur(combo);
    expect(onBlur).toHaveBeenCalled();
  });
});

describe("FormField — autocomplete", () => {
  const objOptions = [
    { value: "v1", label: "Vendor One" },
    { value: "v2", label: "Vendor Two" },
  ];

  it("selects an object option and stores its value", async () => {
    const onChange = jest.fn();
    const onValues = jest.fn();
    render(
      <Harness
        name="vendor"
        label="Vendor"
        type="autocomplete"
        options={objOptions}
        onChange={onChange}
        onValues={onValues}
        defaultValues={{ vendor: "" }}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /open/i }));
    fireEvent.click(await screen.findByText("Vendor Two"));
    expect(onChange).toHaveBeenCalledWith("v2");
    submit();
    await waitFor(() =>
      expect(onValues).toHaveBeenCalledWith({ vendor: "v2" }, true)
    );
  });

  it("preselects the option matching the current field value", () => {
    render(
      <Harness
        name="vendor"
        label="Vendor"
        type="autocomplete"
        options={objOptions}
        defaultValues={{ vendor: "v1" }}
      />
    );
    expect(screen.getByRole("combobox")).toHaveValue("Vendor One");
  });

  it("clears back to an empty value", async () => {
    const onValues = jest.fn();
    const { container } = render(
      <Harness
        name="vendor"
        label="Vendor"
        type="autocomplete"
        options={objOptions}
        onValues={onValues}
        defaultValues={{ vendor: "v1" }}
      />
    );
    // the clear indicator is only visible once the control is focused
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.click(container.querySelector(".MuiAutocomplete-clearIndicator"));
    submit();
    await waitFor(() =>
      expect(onValues).toHaveBeenCalledWith({ vendor: "" }, true)
    );
  });

  it("supports plain string options", async () => {
    const onValues = jest.fn();
    render(
      <Harness
        name="vendor"
        label="Vendor"
        type="autocomplete"
        options={["Acme", "Globex"]}
        onValues={onValues}
        defaultValues={{ vendor: "Acme" }}
      />
    );
    expect(screen.getByRole("combobox")).toHaveValue("Acme");
    fireEvent.click(screen.getByRole("button", { name: /open/i }));
    fireEvent.click(await screen.findByText("Globex"));
    submit();
    await waitFor(() =>
      expect(onValues).toHaveBeenCalledWith({ vendor: "Globex" }, true)
    );
  });

  it("renders an empty option list, disabled state, helper text and the required error", async () => {
    const { unmount } = render(
      <Harness
        name="vendor"
        label="Vendor"
        type="autocomplete"
        options={[]}
        disabled
        defaultValues={{ vendor: "" }}
      />
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
    unmount();

    render(
      <Harness
        name="vendor"
        label="Vendor"
        type="autocomplete"
        options={objOptions}
        required="Please select a vendor"
        defaultValues={{ vendor: "" }}
      />
    );
    submit();
    expect(await screen.findByText("Please select a vendor")).toBeInTheDocument();
  });

  it("forwards onBlur", () => {
    const onBlur = jest.fn();
    render(
      <Harness
        name="vendor"
        label="Vendor"
        type="autocomplete"
        options={objOptions}
        onBlur={onBlur}
        defaultValues={{ vendor: "" }}
      />
    );
    fireEvent.blur(screen.getByRole("combobox"));
    expect(onBlur).toHaveBeenCalled();
  });
});

describe("FormField — radio", () => {
  it("renders string options and records the choice", async () => {
    const onChange = jest.fn();
    const onValues = jest.fn();
    render(
      <Harness
        name="mode"
        label="Mode"
        type="radio"
        row
        options={["Auto", "Manual"]}
        onChange={onChange}
        onValues={onValues}
        defaultValues={{ mode: "" }}
      />
    );
    fireEvent.click(screen.getByRole("radio", { name: "Manual" }));
    expect(onChange).toHaveBeenCalled();
    submit();
    await waitFor(() =>
      expect(onValues).toHaveBeenCalledWith({ mode: "Manual" }, true)
    );
  });

  it("renders object options including a disabled one and helper text", () => {
    render(
      <Harness
        name="mode"
        label="Mode"
        type="radio"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b" },
          { value: "c", label: "Gamma", disabled: true },
        ]}
        helperText="Choose one"
        defaultValues={{ mode: null }}
      />
    );
    expect(screen.getByRole("radio", { name: "Alpha" })).toBeInTheDocument();
    // no label → falls back to the value
    expect(screen.getByRole("radio", { name: "b" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Gamma" })).toBeDisabled();
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });

  it("supports disabled and the required error, and forwards onBlur", async () => {
    const onBlur = jest.fn();
    render(
      <Harness
        name="mode"
        label="Mode"
        type="radio"
        options={["Auto"]}
        onBlur={onBlur}
        required="Mode is mandatory !"
        defaultValues={{ mode: "" }}
      />
    );
    fireEvent.blur(screen.getByRole("radio", { name: "Auto" }));
    expect(onBlur).toHaveBeenCalled();
    submit();
    expect(await screen.findByText("Mode is mandatory !")).toBeInTheDocument();
  });
});

describe("FormField — checkbox and switch", () => {
  it("toggles a checkbox into the form state", async () => {
    const onValues = jest.fn();
    render(
      <Harness
        name="agree"
        label="I agree"
        type="checkbox"
        onValues={onValues}
        defaultValues={{ agree: false }}
      />
    );
    const box = screen.getByRole("checkbox", { name: "I agree" });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(box).toBeChecked();
    submit();
    await waitFor(() => expect(onValues).toHaveBeenCalledWith({ agree: true }, true));
  });

  it("renders a disabled checkbox with helper text and surfaces the required error", async () => {
    const { unmount } = render(
      <Harness
        name="agree"
        label="I agree"
        type="checkbox"
        helperText="Terms apply"
        disabled
        defaultValues={{ agree: false }}
      />
    );
    expect(screen.getByText("Terms apply")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "I agree" })).toBeDisabled();
    unmount();

    render(
      <Harness
        name="agree"
        label="I agree"
        type="checkbox"
        required="You must agree"
        defaultValues={{ agree: false }}
      />
    );
    fireEvent.blur(screen.getByRole("checkbox", { name: "I agree" }));
    submit();
    expect(await screen.findByText("You must agree")).toBeInTheDocument();
  });

  it("toggles a switch into the form state", async () => {
    const onValues = jest.fn();
    render(
      <Harness
        name="active"
        label="Active"
        type="switch"
        helperText="Turn it on"
        onValues={onValues}
        defaultValues={{ active: false }}
      />
    );
    expect(screen.getByText("Turn it on")).toBeInTheDocument();
    const toggle = screen.getByRole("switch", { name: "Active" });
    fireEvent.click(toggle);
    fireEvent.blur(toggle);
    submit();
    await waitFor(() => expect(onValues).toHaveBeenCalledWith({ active: true }, true));
  });

  it("renders a disabled switch and surfaces its required error", async () => {
    render(
      <Harness
        name="active"
        label="Active"
        type="switch"
        disabled
        required="Must be on"
        defaultValues={{ active: false }}
      />
    );
    expect(screen.getByRole("switch", { name: "Active" })).toBeDisabled();
    submit();
    expect(await screen.findByText("Must be on")).toBeInTheDocument();
  });
});

describe("FormField — date", () => {
  const dateField = (name = "Signed On") =>
    screen.getByRole("group", { name });

  it("renders an empty date picker with the default format", () => {
    render(
      <Harness name="signedOn" label="Signed On" type="date" defaultValues={{ signedOn: null }} />
    );
    const field = dateField();
    expect(field).toBeInTheDocument();
    expect(field).toHaveTextContent("DD");
    expect(field).toHaveTextContent("YYYY");
  });

  it("renders the bound dayjs value", () => {
    render(
      <Harness
        name="signedOn"
        label="Signed On"
        type="date"
        defaultValues={{ signedOn: dayjs("2024-03-15") }}
      />
    );
    expect(dateField()).toHaveTextContent("2024");
  });

  it("accepts a custom format, min/max dates and shouldDisableDate", () => {
    const shouldDisableDate = jest.fn(() => false);
    render(
      <Harness
        name="signedOn"
        label="Signed On"
        type="date"
        format="YYYY-MM-DD"
        minDate={dayjs("2024-01-01")}
        maxDate={dayjs("2024-12-31")}
        shouldDisableDate={shouldDisableDate}
        defaultValues={{ signedOn: null }}
      />
    );
    expect(dateField()).toHaveTextContent("YYYY");
  });

  it("pushes a picked date into the form and calls the consumer onChange", async () => {
    const onChange = jest.fn();
    const onValues = jest.fn();
    render(
      <Harness
        name="signedOn"
        label="Signed On"
        type="date"
        onChange={onChange}
        onValues={onValues}
        defaultValues={{ signedOn: dayjs("2024-03-15") }}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("gridcell", { name: "20" }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    // jsdom reports no fine pointer, so the picker opens as the modal variant
    fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    submit();
    await waitFor(() => expect(onValues).toHaveBeenCalled());
    const [values] = onValues.mock.calls[onValues.mock.calls.length - 1];
    expect(dayjs(values.signedOn).date()).toBe(20);
  });

  it("renders disabled, required-error and onBlur passthrough", async () => {
    const onBlur = jest.fn();
    const { unmount } = render(
      <Harness
        name="signedOn"
        label="Signed On"
        type="date"
        disabled
        defaultValues={{ signedOn: null }}
      />
    );
    expect(dateField()).toHaveClass("Mui-disabled");
    unmount();

    render(
      <Harness
        name="signedOn"
        label="Signed On"
        type="date"
        required="Signed on is required !"
        onBlur={onBlur}
        placeholder="Pick a date"
        defaultValues={{ signedOn: null }}
      />
    );
    fireEvent.blur(dateField());
    submit();
    expect(await screen.findByText("Signed on is required !")).toBeInTheDocument();
  });
});
