use crate::hex::HexU8;

#[derive(Clone, Copy)]
pub struct Key(pub u8);

impl Key {
	pub(crate) fn from_hex(s: impl AsRef<[u8]>) -> Option<Self> {
		HexU8::from_bytes(s).map(|HexU8(x)| Key(x))
	}

	pub(crate) fn to_hex(&self) -> [u8; 4] {
		HexU8(self.0).display()
	}
}

pub trait KeyMap {
	fn convert_key(&self, key: Key) -> Key;
}

const PRINTABLE_LEN: u8 = 128;

pub struct AsciiMap([u8; PRINTABLE_LEN as usize]);

impl Default for AsciiMap {
	fn default() -> Self {
		Self([0u8; PRINTABLE_LEN as usize])
	}
}

impl AsciiMap {
	fn put(&mut self, key: u8, value: u8) {
		if key < PRINTABLE_LEN && value < PRINTABLE_LEN {
			self.0[key as usize] = value
		}
	}

	pub fn from_ascii(s: &[u8]) -> Self {
		let mut ret = Self::default();

		for entry in s.chunks(2) {
			if let [key, value] = entry {
				ret.put(*key, *value)
			}
		}

		ret
	}

	// pub fn to_ascii(&self) -> Vec<u8> {
	// 	let mut ret = Vec::new();

	// 	for i in 0..PRINTABLE_LEN {
	// 		let a = self.0[i as usize];
	// 		if a != 0 {
	// 			ret.push(i);
	// 			ret.push(a);
	// 		}
	// 	}

	// 	ret
	// }
}

impl KeyMap for &AsciiMap {
	fn convert_key(&self, key: Key) -> Key {
		match self.0.get(key.0 as usize) {
			Some(0) => key,
			Some(x) => Key(*x),
			None => key,
		}
	}
}
