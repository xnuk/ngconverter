use alloc::borrow::Cow;
use alloc::vec::Vec;
use quick_xml::{
	events::{attributes::Attribute, BytesStart, Event},
	name::QName,
	reader::Reader,
	writer::Writer,
};

use crate::keymap::{AsciiMap, Key, KeyMap};

#[inline]
fn is_name(name: QName, equal_to: &[u8]) -> bool {
	name.local_name().into_inner() == equal_to
}

#[derive(Default)]
pub struct State {
	am_i_right: bool,
}

pub fn each_event<'a>(
	state: &mut State,
	keymap: impl KeyMap,
	event: Event<'a>,
) -> Event<'a> {
	match event {
		Event::Eof => event,

		Event::Start(ref x) => {
			if is_name(x.name(), b"KeyTable") {
				state.am_i_right = true;
			}
			event
		}

		Event::End(ref x) => {
			if is_name(x.name(), b"KeyTable") {
				state.am_i_right = false;
			}
			event
		}

		Event::Empty(ref x) => {
			if state.am_i_right && is_name(x.name(), b"Key") {
				let attrs = x.attributes().filter_map(|x| {
					let attr = x.ok()?;
					if is_name(attr.key, b"at") {
						if let Some(value) = Key::from_hex(&attr.value) {
							let value = KeyMap::convert_key(&keymap, value);
							return Some(Attribute {
								key: attr.key,
								value: Cow::Owned(value.to_hex().to_vec()),
							});
						}
					}

					Some(attr)
				});

				let mut tag = BytesStart::new("Key");
				tag.extend_attributes(attrs);

				Event::Empty(tag)
			} else {
				event
			}
		}

		x => x,
	}
}

pub fn from_str(input: &[u8], keymap: &[u8]) -> Option<Vec<u8>> {
	let mut output = Vec::with_capacity(input.len());
	let mut reader = Reader::from_reader(input);
	let mut writer = Writer::new(&mut output);
	let mut cache = Vec::new();
	let mut state = State::default();

	let keymap = AsciiMap::from_ascii(keymap);

	loop {
		let item = reader.read_event_into(&mut cache).ok()?;
		if matches!(item, Event::Eof) {
			break;
		}

		writer
			.write_event(each_event(&mut state, &keymap, item))
			.ok()?;
		cache.clear();
	}

	Some(output)
}
